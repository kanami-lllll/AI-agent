package cn.bugstack.ai.domain.agent.service.armory.node;

import cn.bugstack.ai.domain.agent.model.entity.AiAgentEngineStarterEntity;
import cn.bugstack.ai.domain.agent.model.valobj.AiClientModelVO;
import cn.bugstack.ai.domain.agent.service.armory.AbstractArmorySupport;
import cn.bugstack.ai.domain.agent.service.armory.factory.DefaultArmoryStrategyFactory;
import cn.bugstack.wrench.design.framework.tree.StrategyHandler;
import com.alibaba.fastjson.JSON;
import io.modelcontextprotocol.client.McpSyncClient;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.mcp.SyncMcpToolCallbackProvider;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class AiClientModelNode extends AbstractArmorySupport {

    @Resource
    private AiClientNode aiClientNode;

    @Override
    protected String doApply(AiAgentEngineStarterEntity requestParameter, DefaultArmoryStrategyFactory.DynamicContext dynamicContext) throws Exception {
        log.info("Ai Agent 构建，客户端模型节点 {}", JSON.toJSONString(requestParameter));

        List<AiClientModelVO> aiClientModelList = dynamicContext.getValue("aiClientModelList");
        if (aiClientModelList == null || aiClientModelList.isEmpty()) {
            log.warn("没有可用的 AI 客户端模型配置");
            return null;
        }

        for (AiClientModelVO modelVO : aiClientModelList) {
            OpenAiChatModel chatModel = createOpenAiChatModel(modelVO);
            registerBean(beanName(modelVO.getId()), OpenAiChatModel.class, chatModel /* 每条模型配置都会注册成独立的 ChatModel Bean */);
        }

        return router(requestParameter, dynamicContext);
    }

    @Override
    public StrategyHandler<AiAgentEngineStarterEntity, DefaultArmoryStrategyFactory.DynamicContext, String> get(AiAgentEngineStarterEntity requestParameter, DefaultArmoryStrategyFactory.DynamicContext dynamicContext) throws Exception {
        return aiClientNode;
    }

    @Override
    protected String beanName(Long id) {
        return "AiClientModel_" + id;
    }

    private OpenAiChatModel createOpenAiChatModel(AiClientModelVO modelVO) {
        OpenAiApi openAiApi = OpenAiApi.builder()
                .baseUrl(modelVO.getBaseUrl())
                .apiKey(modelVO.getApiKey())
                .completionsPath(modelVO.getCompletionsPath())
                .embeddingsPath(modelVO.getEmbeddingsPath())
                .build() /* 模型访问统一收敛到 OpenAI 兼容接口 */ ;

        List<McpSyncClient> mcpSyncClients = new ArrayList<>();
        List<AiClientModelVO.AIClientModelToolConfigVO> toolConfigs = modelVO.getAiClientModelToolConfigs();
        if (toolConfigs != null && !toolConfigs.isEmpty()) {
            for (AiClientModelVO.AIClientModelToolConfigVO toolConfig : toolConfigs) {
                Long toolId = toolConfig.getToolId();
                McpSyncClient mcpSyncClient = getBean("AiClientToolMcp_" + toolId);
                mcpSyncClients.add(mcpSyncClient /* 这里挂的是模型级工具，直接绑定到 ChatModel */);
            }
        }

        return OpenAiChatModel.builder()
                .openAiApi(openAiApi)
                .defaultOptions(OpenAiChatOptions.builder()
                        .model(modelVO.getModelVersion())
                        .toolCallbacks(new SyncMcpToolCallbackProvider(mcpSyncClients).getToolCallbacks())
                        .build())
                .build();
    }

}

package cn.bugstack.ai.domain.agent.service.armory.node;

import cn.bugstack.ai.domain.agent.model.entity.AiAgentEngineStarterEntity;
import cn.bugstack.ai.domain.agent.model.valobj.AiClientSystemPromptVO;
import cn.bugstack.ai.domain.agent.model.valobj.AiClientVO;
import cn.bugstack.ai.domain.agent.service.armory.AbstractArmorySupport;
import cn.bugstack.ai.domain.agent.service.armory.factory.DefaultArmoryStrategyFactory;
import cn.bugstack.wrench.design.framework.tree.StrategyHandler;
import com.alibaba.fastjson.JSON;
import io.modelcontextprotocol.client.McpSyncClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.api.Advisor;
import org.springframework.ai.mcp.SyncMcpToolCallbackProvider;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class AiClientNode extends AbstractArmorySupport {

    @Override
    protected String doApply(AiAgentEngineStarterEntity requestParameter, DefaultArmoryStrategyFactory.DynamicContext dynamicContext) throws Exception {
        log.info("Ai Agent 构建，对话模型节点 {}", JSON.toJSONString(requestParameter));

        List<AiClientVO> aiClientVOList = dynamicContext.getValue("aiClientList");
        Map<Long, AiClientSystemPromptVO> aiClientSystemPromptVOMap = dynamicContext.getValue("aiSystemPromptConfig");

        for (AiClientVO aiClientVO : aiClientVOList) {
            String defaultSystem = "AI 智能体" /* ChatClient 表示运行时已经装配完成的智能体客户端 */ ;
            AiClientSystemPromptVO systemPrompt = aiClientSystemPromptVOMap.get(aiClientVO.getSystemPromptId());
            if (systemPrompt != null) {
                defaultSystem = systemPrompt.getPromptContent();
            }

            OpenAiChatModel chatModel = getBean(aiClientVO.getModelBeanName() /* 这里复用前一个节点创建好的模型 Bean */);

            List<McpSyncClient> mcpSyncClients = new ArrayList<>() /* 收集客户端级别的 MCP 工具 */ ;
            List<String> mcpBeanNameList = aiClientVO.getMcpBeanNameList();
            for (String mcpBeanName : mcpBeanNameList) {
                mcpSyncClients.add(getBean(mcpBeanName));
            }

            List<Advisor> advisors = new ArrayList<>() /* 收集客户端级别的 Advisor，比如记忆和 RAG */ ;
            List<String> advisorBeanNameList = aiClientVO.getAdvisorBeanNameList();
            for (String advisorBeanName : advisorBeanNameList) {
                advisors.add(getBean(advisorBeanName));
            }
            Advisor[] advisorArray = advisors.toArray(new Advisor[]{});

            ChatClient chatClient = ChatClient.builder(chatModel)
                    .defaultSystem(defaultSystem)
                    .defaultToolCallbacks(new SyncMcpToolCallbackProvider(mcpSyncClients.toArray(new McpSyncClient[]{})))
                    .defaultAdvisors(advisorArray)
                    .build();

            registerBean(beanName(aiClientVO.getClientId()), ChatClient.class, chatClient /* 按 clientId 注册运行时 ChatClient */);
        }

        return router(requestParameter, dynamicContext);
    }

    @Override
    public StrategyHandler<AiAgentEngineStarterEntity, DefaultArmoryStrategyFactory.DynamicContext, String> get(AiAgentEngineStarterEntity requestParameter, DefaultArmoryStrategyFactory.DynamicContext dynamicContext) throws Exception {
        return defaultStrategyHandler;
    }

    @Override
    protected String beanName(Long id) {
        return "ChatClient_" + id;
    }

}

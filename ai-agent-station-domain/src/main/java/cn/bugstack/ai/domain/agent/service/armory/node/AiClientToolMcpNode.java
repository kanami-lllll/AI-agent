package cn.bugstack.ai.domain.agent.service.armory.node;

import cn.bugstack.ai.domain.agent.model.entity.AiAgentEngineStarterEntity;
import cn.bugstack.ai.domain.agent.model.valobj.AiClientToolMcpVO;
import cn.bugstack.ai.domain.agent.service.armory.AbstractArmorySupport;
import cn.bugstack.ai.domain.agent.service.armory.factory.DefaultArmoryStrategyFactory;
import cn.bugstack.wrench.design.framework.tree.StrategyHandler;
import com.alibaba.fastjson.JSON;
import io.modelcontextprotocol.client.McpClient;
import io.modelcontextprotocol.client.McpSyncClient;
import io.modelcontextprotocol.client.transport.HttpClientSseClientTransport;
import io.modelcontextprotocol.client.transport.ServerParameters;
import io.modelcontextprotocol.client.transport.StdioClientTransport;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class AiClientToolMcpNode extends AbstractArmorySupport {

    @Resource
    private AiClientAdvisorNode aiClientAdvisorNode;

    @Override
    protected String doApply(AiAgentEngineStarterEntity requestParameter, DefaultArmoryStrategyFactory.DynamicContext dynamicContext) throws Exception {
        log.info("Ai Agent 构建，tool mcp 节点 {}", JSON.toJSONString(requestParameter));

        List<AiClientToolMcpVO> aiClientToolMcpList = dynamicContext.getValue("aiClientToolMcpList");
        if (aiClientToolMcpList == null || aiClientToolMcpList.isEmpty()) {
            log.warn("没有可用的 AI 客户端工具配置 MCP");
            return router(requestParameter, dynamicContext);
        }

        for (AiClientToolMcpVO mcpVO : aiClientToolMcpList) {
            McpSyncClient mcpSyncClient = createMcpSyncClient(mcpVO);
            registerBean(beanName(mcpVO.getId()), McpSyncClient.class, mcpSyncClient /* 每条 MCP 配置都会注册成独立的 McpSyncClient Bean */);
        }

        return router(requestParameter, dynamicContext);
    }

    @Override
    public StrategyHandler<AiAgentEngineStarterEntity, DefaultArmoryStrategyFactory.DynamicContext, String> get(AiAgentEngineStarterEntity requestParameter, DefaultArmoryStrategyFactory.DynamicContext dynamicContext) throws Exception {
        return aiClientAdvisorNode;
    }

    @Override
    protected String beanName(Long id) {
        return "AiClientToolMcp_" + id;
    }

    protected McpSyncClient createMcpSyncClient(AiClientToolMcpVO aiClientToolMcpVO) {
        String transportType = aiClientToolMcpVO.getTransportType();

        switch (transportType) {
            case "sse" -> {
                AiClientToolMcpVO.TransportConfigSse transportConfigSse = aiClientToolMcpVO.getTransportConfigSse();
                String originalBaseUri = transportConfigSse.getBaseUri() /* 兼容带查询参数的 SSE 地址写法 */ ;
                String baseUri;
                String sseEndpoint;

                int queryParamStartIndex = originalBaseUri.indexOf("sse");
                if (queryParamStartIndex != -1) {
                    baseUri = originalBaseUri.substring(0, queryParamStartIndex - 1);
                    sseEndpoint = originalBaseUri.substring(queryParamStartIndex - 1);
                } else {
                    baseUri = originalBaseUri;
                    sseEndpoint = transportConfigSse.getSseEndpoint();
                }

                sseEndpoint = StringUtils.isBlank(sseEndpoint) ? "/sse" : sseEndpoint;

                HttpClientSseClientTransport sseClientTransport = HttpClientSseClientTransport
                        .builder(baseUri)
                        .sseEndpoint(sseEndpoint)
                        .build();

                McpSyncClient mcpSyncClient = McpClient.sync(sseClientTransport)
                        .requestTimeout(Duration.ofMinutes(aiClientToolMcpVO.getRequestTimeout()))
                        .build();
                var initSse = mcpSyncClient.initialize();
                log.info("Tool SSE MCP Initialized {}", initSse);
                return mcpSyncClient;
            }
            case "stdio" -> {
                AiClientToolMcpVO.TransportConfigStdio transportConfigStdio = aiClientToolMcpVO.getTransportConfigStdio();
                Map<String, AiClientToolMcpVO.TransportConfigStdio.Stdio> stdioMap = transportConfigStdio.getStdio();
                AiClientToolMcpVO.TransportConfigStdio.Stdio stdio = stdioMap.get(aiClientToolMcpVO.getMcpName());

                ServerParameters stdioParams = ServerParameters.builder(stdio.getCommand())
                        .args(stdio.getArgs())
                        .build() /* stdio 模式会拉起本地 MCP 进程并通过标准输入输出通信 */ ;
                McpSyncClient mcpClient = McpClient.sync(new StdioClientTransport(stdioParams))
                        .requestTimeout(Duration.ofSeconds(aiClientToolMcpVO.getRequestTimeout()))
                        .build();
                var initStdio = mcpClient.initialize();
                log.info("Tool Stdio MCP Initialized {}", initStdio);
                return mcpClient;
            }
            default -> throw new RuntimeException("err! transportType " + transportType + " not exist!");
        }
    }

}

package cn.bugstack.ai.domain.agent.service.preheat;

import cn.bugstack.ai.domain.agent.adapter.repository.IAgentRepository;
import cn.bugstack.ai.domain.agent.model.entity.AiAgentEngineStarterEntity;
import cn.bugstack.ai.domain.agent.service.IAiAgentPreheatService;
import cn.bugstack.ai.domain.agent.service.armory.factory.DefaultArmoryStrategyFactory;
import cn.bugstack.wrench.design.framework.tree.StrategyHandler;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * 预热服务。
 * 应用启动后会先把数据库里启用中的客户端配置装配成运行时对象，避免首次请求再临时构建。
 */
@Slf4j
@Service
public class AiAgentPreheatService implements IAiAgentPreheatService {

    @Resource
    private DefaultArmoryStrategyFactory defaultArmoryStrategyFactory;

    @Resource
    private IAgentRepository repository;

    @Override
    public void preheat() throws Exception {
        // 先查出所有启用中的 clientId，再交给装配链一次性完成：
        // MCP 工具、Advisor、模型、ChatClient 的构建与注册。
        List<Long> aiClientIds = repository.queryAiClientIds();
        StrategyHandler<AiAgentEngineStarterEntity, DefaultArmoryStrategyFactory.DynamicContext, String> handler =
                defaultArmoryStrategyFactory.strategyHandler();
        handler.apply(AiAgentEngineStarterEntity.builder()
                .clientIdList(aiClientIds)
                .build(), new DefaultArmoryStrategyFactory.DynamicContext());
    }

    @Override
    public void preheat(Long aiClientId) throws Exception {
        // 后台如果只修改了某一个 client，就只重建这一条配置对应的运行时对象。
        StrategyHandler<AiAgentEngineStarterEntity, DefaultArmoryStrategyFactory.DynamicContext, String> handler =
                defaultArmoryStrategyFactory.strategyHandler();
        handler.apply(AiAgentEngineStarterEntity.builder()
                .clientIdList(Collections.singletonList(aiClientId))
                .build(), new DefaultArmoryStrategyFactory.DynamicContext());
    }

}

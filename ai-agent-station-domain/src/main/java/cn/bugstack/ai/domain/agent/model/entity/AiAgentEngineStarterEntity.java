package cn.bugstack.ai.domain.agent.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 引擎启动器实体对象
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiAgentEngineStarterEntity {

    private List<Long> clientIdList;

}


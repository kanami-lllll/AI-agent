package cn.bugstack.ai.infrastructure.adapter.repository;

import cn.bugstack.ai.domain.agent.adapter.repository.IAgentRepository;
import cn.bugstack.ai.domain.agent.model.valobj.AiAgentTaskScheduleVO;
import cn.bugstack.ai.domain.agent.model.valobj.AiClientAdvisorVO;
import cn.bugstack.ai.domain.agent.model.valobj.AiClientModelVO;
import cn.bugstack.ai.domain.agent.model.valobj.AiClientSystemPromptVO;
import cn.bugstack.ai.domain.agent.model.valobj.AiClientToolMcpVO;
import cn.bugstack.ai.domain.agent.model.valobj.AiClientVO;
import cn.bugstack.ai.domain.agent.model.valobj.AiRagOrderVO;
import cn.bugstack.ai.infrastructure.dao.IAIClientModelToolConfigDao;
import cn.bugstack.ai.infrastructure.dao.IAiAgentDao;
import cn.bugstack.ai.infrastructure.dao.IAiAgentTaskScheduleDao;
import cn.bugstack.ai.infrastructure.dao.IAiClientAdvisorConfigDao;
import cn.bugstack.ai.infrastructure.dao.IAiClientAdvisorDao;
import cn.bugstack.ai.infrastructure.dao.IAiClientModelConfigDao;
import cn.bugstack.ai.infrastructure.dao.IAiClientModelDao;
import cn.bugstack.ai.infrastructure.dao.IAiClientSystemPromptConfigDao;
import cn.bugstack.ai.infrastructure.dao.IAiClientSystemPromptDao;
import cn.bugstack.ai.infrastructure.dao.IAiClientToolConfigDao;
import cn.bugstack.ai.infrastructure.dao.IAiClientToolMcpDao;
import cn.bugstack.ai.infrastructure.dao.IAiRagOrderDao;
import cn.bugstack.ai.infrastructure.dao.po.AIClientModelToolConfig;
import cn.bugstack.ai.infrastructure.dao.po.AiAgentTaskSchedule;
import cn.bugstack.ai.infrastructure.dao.po.AiClientAdvisor;
import cn.bugstack.ai.infrastructure.dao.po.AiClientAdvisorConfig;
import cn.bugstack.ai.infrastructure.dao.po.AiClientModel;
import cn.bugstack.ai.infrastructure.dao.po.AiClientModelConfig;
import cn.bugstack.ai.infrastructure.dao.po.AiClientSystemPrompt;
import cn.bugstack.ai.infrastructure.dao.po.AiClientSystemPromptConfig;
import cn.bugstack.ai.infrastructure.dao.po.AiClientToolConfig;
import cn.bugstack.ai.infrastructure.dao.po.AiClientToolMcp;
import cn.bugstack.ai.infrastructure.dao.po.AiRagOrder;
import com.alibaba.fastjson.JSON;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Repository
public class AgentRepository implements IAgentRepository {

    @Resource
    private IAiAgentDao aiAgentDao;

    @Resource
    private IAiClientModelDao aiClientModelDao;

    @Resource
    private IAiClientModelConfigDao aiClientModelConfigDao;

    @Resource
    private IAIClientModelToolConfigDao aiClientModelToolConfigDao;

    @Resource
    private IAiClientToolMcpDao aiClientToolMcpDao;

    @Resource
    private IAiClientToolConfigDao aiClientToolConfigDao;

    @Resource
    private IAiClientAdvisorDao aiClientAdvisorDao;

    @Resource
    private IAiClientAdvisorConfigDao aiClientAdvisorConfigDao;

    @Resource
    private IAiClientSystemPromptDao aiClientSystemPromptDao;

    @Resource
    private IAiClientSystemPromptConfigDao aiClientSystemPromptConfigDao;

    @Resource
    private IAiAgentTaskScheduleDao aiAgentTaskScheduleDao;

    @Resource
    private IAiRagOrderDao aiRagOrderDao;

    @Override
    public List<AiClientModelVO> queryAiClientModelVOListByClientIds(List<Long> clientIdList) {
        List<AiClientModel> aiClientModels =
                aiClientModelDao.queryModelConfigByClientIds(clientIdList) /* 聚合模型配置和模型级工具配置 */ ;
        if (aiClientModels == null || aiClientModels.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> modelIds = aiClientModels.stream().map(AiClientModel::getId).toList();
        List<AIClientModelToolConfig> aiClientModelToolConfigs =
                aiClientModelToolConfigDao.queryModelToolConfigByModelIds(modelIds);
        Map<Long, List<AIClientModelToolConfig>> toolConfigMap = aiClientModelToolConfigs.stream()
                .collect(Collectors.groupingBy(AIClientModelToolConfig::getModelId));

        List<AiClientModelVO> aiClientModelVOList = new ArrayList<>();
        for (AiClientModel aiClientModel : aiClientModels) {
            AiClientModelVO vo = new AiClientModelVO();
            vo.setId(aiClientModel.getId());
            vo.setModelName(aiClientModel.getModelName());
            vo.setBaseUrl(aiClientModel.getBaseUrl());
            vo.setApiKey(aiClientModel.getApiKey());
            vo.setCompletionsPath(aiClientModel.getCompletionsPath());
            vo.setEmbeddingsPath(aiClientModel.getEmbeddingsPath());
            vo.setModelType(aiClientModel.getModelType());
            vo.setModelVersion(aiClientModel.getModelVersion());
            vo.setTimeout(aiClientModel.getTimeout());

            List<AIClientModelToolConfig> toolConfigs =
                    toolConfigMap.getOrDefault(aiClientModel.getId(), Collections.emptyList());
            if (!toolConfigs.isEmpty()) {
                List<AiClientModelVO.AIClientModelToolConfigVO> toolConfigVOs = new ArrayList<>();
                for (AIClientModelToolConfig toolConfig : toolConfigs) {
                    AiClientModelVO.AIClientModelToolConfigVO toolConfigVO =
                            new AiClientModelVO.AIClientModelToolConfigVO();
                    toolConfigVO.setId(toolConfig.getId());
                    toolConfigVO.setModelId(toolConfig.getModelId());
                    toolConfigVO.setToolType(toolConfig.getToolType());
                    toolConfigVO.setToolId(toolConfig.getToolId());
                    toolConfigVO.setCreateTime(toolConfig.getCreateTime());
                    toolConfigVOs.add(toolConfigVO);
                }
                vo.setAiClientModelToolConfigs(toolConfigVOs);
            }

            aiClientModelVOList.add(vo);
        }

        return aiClientModelVOList;
    }

    @Override
    public List<AiClientToolMcpVO> queryAiClientToolMcpVOListByClientIds(List<Long> clientIdList) {
        List<AiClientToolMcp> aiClientToolMcps = aiClientToolMcpDao.queryMcpConfigByClientIds(clientIdList);
        List<AiClientToolMcpVO> aiClientToolMcpVOList = new ArrayList<>();
        if (aiClientToolMcps == null || aiClientToolMcps.isEmpty()) {
            return aiClientToolMcpVOList;
        }

        for (AiClientToolMcp aiClientToolMcp : aiClientToolMcps) {
            AiClientToolMcpVO vo = new AiClientToolMcpVO();
            vo.setId(aiClientToolMcp.getId());
            vo.setMcpName(aiClientToolMcp.getMcpName());
            vo.setTransportType(aiClientToolMcp.getTransportType());
            vo.setRequestTimeout(aiClientToolMcp.getRequestTimeout());

            String transportType = aiClientToolMcp.getTransportType();
            String transportConfig = aiClientToolMcp.getTransportConfig() /* transportConfig 在库里是 JSON，这里先转成强类型对象 */ ;

            try {
                if ("sse".equals(transportType)) {
                    ObjectMapper objectMapper = new ObjectMapper();
                    AiClientToolMcpVO.TransportConfigSse sseConfig =
                            objectMapper.readValue(transportConfig, AiClientToolMcpVO.TransportConfigSse.class);
                    vo.setTransportConfigSse(sseConfig);
                } else if ("stdio".equals(transportType)) {
                    Map<String, AiClientToolMcpVO.TransportConfigStdio.Stdio> stdio =
                            JSON.parseObject(transportConfig, new com.alibaba.fastjson.TypeReference<>() {
                            });
                    AiClientToolMcpVO.TransportConfigStdio stdioConfig = new AiClientToolMcpVO.TransportConfigStdio();
                    stdioConfig.setStdio(stdio);
                    vo.setTransportConfigStdio(stdioConfig);
                }
            } catch (Exception e) {
                log.error("解析传输配置失败: {}", e.getMessage(), e);
            }
            aiClientToolMcpVOList.add(vo);
        }

        return aiClientToolMcpVOList;
    }

    @Override
    public List<AiClientAdvisorVO> queryAdvisorConfigByClientIds(List<Long> clientIdList) {
        List<AiClientAdvisor> aiClientAdvisors = aiClientAdvisorDao.queryAdvisorConfigByClientIds(clientIdList);
        if (aiClientAdvisors == null || aiClientAdvisors.isEmpty()) {
            return Collections.emptyList();
        }

        return aiClientAdvisors.stream().map(advisor -> {
            AiClientAdvisorVO vo = AiClientAdvisorVO.builder()
                    .id(advisor.getId())
                    .advisorName(advisor.getAdvisorName())
                    .advisorType(advisor.getAdvisorType())
                    .orderNum(advisor.getOrderNum())
                    .build();

            if (StringUtils.isNotEmpty(advisor.getExtParam() /* extParam 在库里是 JSON，这里先解析成强类型对象 */)) {
                try {
                    if ("ChatMemory".equals(advisor.getAdvisorType())) {
                        AiClientAdvisorVO.ChatMemory chatMemory =
                                JSON.parseObject(advisor.getExtParam(), AiClientAdvisorVO.ChatMemory.class);
                        vo.setChatMemory(chatMemory);
                    } else if ("RagAnswer".equals(advisor.getAdvisorType())) {
                        AiClientAdvisorVO.RagAnswer ragAnswer =
                                JSON.parseObject(advisor.getExtParam(), AiClientAdvisorVO.RagAnswer.class);
                        vo.setRagAnswer(ragAnswer);
                    }
                } catch (Exception e) {
                    log.error("解析 extParam 失败，advisorId={}，extParam={}", advisor.getId(), advisor.getExtParam(), e);
                }
            }

            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<Long, AiClientSystemPromptVO> querySystemPromptConfigByClientIds(List<Long> clientIdList) {
        List<AiClientSystemPrompt> aiClientSystemPrompts =
                aiClientSystemPromptDao.querySystemPromptConfigByClientIds(clientIdList);
        if (aiClientSystemPrompts == null || aiClientSystemPrompts.isEmpty()) {
            return Collections.emptyMap();
        }

        return aiClientSystemPrompts.stream()
                .map(prompt -> AiClientSystemPromptVO.builder()
                        .id(prompt.getId())
                        .promptContent(prompt.getPromptContent())
                        .build())
                .collect(Collectors.toMap(
                        AiClientSystemPromptVO::getId,
                        prompt -> prompt,
                        (existing, replacement) -> existing
                )) /* 提示词配置在运行时按 promptId 查找，这里直接组装成 Map */ ;
    }

    @Override
    public List<AiClientVO> queryAiClientByClientIds(List<Long> clientIdList) {
        if (clientIdList == null || clientIdList.isEmpty()) {
            return Collections.emptyList();
        }

        List<AiClientSystemPromptConfig> systemPromptConfigs =
                aiClientSystemPromptConfigDao.querySystemPromptConfigByClientIds(clientIdList) /* 这里负责把提示词、模型、工具、Advisor 的关联关系整合成 client 视图对象 */ ;
        Map<Long, AiClientSystemPromptConfig> systemPromptConfigMap = systemPromptConfigs.stream()
                .collect(Collectors.toMap(AiClientSystemPromptConfig::getClientId, prompt -> prompt, (a, b) -> a));

        List<AiClientModelConfig> modelConfigs = aiClientModelConfigDao.queryModelConfigByClientIds(clientIdList);
        Map<Long, AiClientModelConfig> modelConfigMap = modelConfigs.stream()
                .collect(Collectors.toMap(AiClientModelConfig::getClientId, model -> model, (a, b) -> a));

        List<AiClientToolConfig> clientToolConfigs = aiClientToolConfigDao.queryToolConfigByClientIds(clientIdList);
        Map<Long, List<AiClientToolConfig>> mcpMap = clientToolConfigs.stream()
                .filter(config -> "mcp".equals(config.getToolType()))
                .collect(Collectors.groupingBy(AiClientToolConfig::getClientId));

        List<AiClientAdvisorConfig> advisorConfigs =
                aiClientAdvisorConfigDao.queryClientAdvisorConfigByClientIds(clientIdList);
        Map<Long, List<AiClientAdvisorConfig>> advisorConfigMap = advisorConfigs.stream()
                .collect(Collectors.groupingBy(AiClientAdvisorConfig::getClientId));

        List<AiClientVO> result = new ArrayList<>();
        for (Long clientId : clientIdList) {
            AiClientVO clientVO = AiClientVO.builder()
                    .clientId(clientId)
                    .build();

            if (systemPromptConfigMap.containsKey(clientId)) {
                clientVO.setSystemPromptId(systemPromptConfigMap.get(clientId).getSystemPromptId());
            }

            if (modelConfigMap.containsKey(clientId)) {
                clientVO.setModelBeanId(String.valueOf(modelConfigMap.get(clientId).getModelId()));
            }

            if (mcpMap.containsKey(clientId)) {
                List<String> mcpBeanIdList = mcpMap.get(clientId).stream()
                        .map(mcp -> String.valueOf(mcp.getToolId()))
                        .collect(Collectors.toList());
                clientVO.setMcpBeanIdList(mcpBeanIdList);
            } else {
                clientVO.setMcpBeanIdList(new ArrayList<>());
            }

            if (advisorConfigMap.containsKey(clientId)) {
                List<String> advisorBeanIdList = advisorConfigMap.get(clientId).stream()
                        .map(advisor -> String.valueOf(advisor.getAdvisorId()))
                        .collect(Collectors.toList());
                clientVO.setAdvisorBeanIdList(advisorBeanIdList);
            } else {
                clientVO.setAdvisorBeanIdList(new ArrayList<>());
            }

            result.add(clientVO);
        }

        return result;
    }

    @Override
    public List<Long> queryAiClientIds() {
        return aiAgentDao.queryValidClientIds() /* 查询启用中的 clientId，用于启动预热 */ ;
    }

    @Override
    public List<Long> queryAiClientIdsByAiAgentId(Long aiAgentId) {
        return aiAgentDao.queryClientIdsByAgentId(aiAgentId);
    }

    @Override
    public List<AiAgentTaskScheduleVO> queryAllValidTaskSchedule() {
        List<AiAgentTaskSchedule> aiAgentTaskSchedules = aiAgentTaskScheduleDao.queryAllValidTaskSchedule();
        if (aiAgentTaskSchedules == null || aiAgentTaskSchedules.isEmpty()) {
            return Collections.emptyList();
        }

        return aiAgentTaskSchedules.stream()
                .map(schedule -> {
                    AiAgentTaskScheduleVO vo = new AiAgentTaskScheduleVO();
                    vo.setId(schedule.getId());
                    vo.setAgentId(schedule.getAgentId());
                    vo.setDescription(schedule.getDescription());
                    vo.setCronExpression(schedule.getCronExpression());
                    vo.setTaskParam(schedule.getTaskParam());
                    return vo;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Long> queryAllInvalidTaskScheduleIds() {
        return aiAgentTaskScheduleDao.queryAllInvalidTaskScheduleIds();
    }

    @Override
    public void createTagOrder(AiRagOrderVO aiRagOrderVO) {
        AiRagOrder aiRagOrder = new AiRagOrder();
        aiRagOrder.setRagName(aiRagOrderVO.getRagName());
        aiRagOrder.setKnowledgeTag(aiRagOrderVO.getKnowledgeTag());
        aiRagOrder.setStatus(1);
        aiRagOrder.setCreateTime(new Date());
        aiRagOrder.setUpdateTime(new Date());
        aiRagOrderDao.insert(aiRagOrder);
    }

    @Override
    public String queryRagKnowledgeTag(Long ragId) {
        AiRagOrder aiRagOrder = aiRagOrderDao.queryRagOrderById(ragId);
        return aiRagOrder.getKnowledgeTag();
    }

    @Override
    public Long queryAiClientModelIdByAgentId(Long aiAgentId) {
        return aiClientModelConfigDao.queryAiClientModelIdByAgentId(aiAgentId);
    }

}

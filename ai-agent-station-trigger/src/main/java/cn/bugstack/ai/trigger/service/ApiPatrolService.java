package cn.bugstack.ai.trigger.service;

import cn.bugstack.ai.domain.agent.service.armory.factory.DefaultArmoryStrategyFactory;
import cn.bugstack.ai.infrastructure.dao.IApiPatrolConfigDao;
import cn.bugstack.ai.infrastructure.dao.IApiPatrolResultDao;
import cn.bugstack.ai.infrastructure.dao.po.ApiPatrolConfig;
import cn.bugstack.ai.infrastructure.dao.po.ApiPatrolResult;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * API patrol execution service.
 */
@Slf4j
@Service
public class ApiPatrolService {

    @Resource
    private IApiPatrolConfigDao apiPatrolConfigDao;

    @Resource
    private IApiPatrolResultDao apiPatrolResultDao;

    @Resource
    private DefaultArmoryStrategyFactory defaultArmoryStrategyFactory;

    @Resource
    private ObjectMapper objectMapper;

    public ApiPatrolResult execute(Long patrolId) {
        ApiPatrolConfig config = apiPatrolConfigDao.queryApiPatrolConfigById(patrolId);
        if (null == config) {
            throw new RuntimeException("API patrol config not found");
        }
        if (null != config.getStatus() && 0 == config.getStatus()) {
            throw new RuntimeException("API patrol config is disabled");
        }

        ApiPatrolResult result = new ApiPatrolResult();
        result.setPatrolId(config.getId());
        result.setCreateTime(new Date());

        long start = System.currentTimeMillis();
        List<String> failedReasons = new ArrayList<>();

        try {
            HttpResponse<String> response = sendRequest(config);
            long duration = System.currentTimeMillis() - start;

            result.setResponseCode(response.statusCode());
            result.setResponseTime(duration);
            result.setResponseBody(response.body());

            if (null != config.getExpectedStatusCode() && !config.getExpectedStatusCode().equals(response.statusCode())) {
                failedReasons.add("Status code mismatch, expected " + config.getExpectedStatusCode() + ", actual " + response.statusCode());
            }

            if (StringUtils.isNotBlank(config.getExpectedJsonField()) && !jsonFieldExists(response.body(), config.getExpectedJsonField())) {
                failedReasons.add("Missing JSON field: " + config.getExpectedJsonField());
            }

            if (null != config.getMaxResponseTime() && duration > config.getMaxResponseTime()) {
                failedReasons.add("Response time exceeded, expected less than " + config.getMaxResponseTime() + "ms, actual " + duration + "ms");
            }

            result.setSuccess(failedReasons.isEmpty() ? 1 : 0);
            result.setErrorMessage(failedReasons.isEmpty() ? null : String.join("; ", failedReasons));
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            log.error("Execute API patrol failed patrolId={}", patrolId, e);
            result.setSuccess(0);
            result.setResponseTime(duration);
            result.setErrorMessage("Request execution failed: " + e.getMessage());
        }

        result.setAiReport(buildAiReport(config, result));
        apiPatrolResultDao.insert(result);
        return apiPatrolResultDao.queryApiPatrolResultById(result.getId());
    }

    private HttpResponse<String> sendRequest(ApiPatrolConfig config) throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(null == config.getTimeout() ? 5000 : config.getTimeout()))
                .build();

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(config.getRequestUrl()))
                .timeout(Duration.ofMillis(null == config.getTimeout() ? 5000 : config.getTimeout()));

        if (StringUtils.isNotBlank(config.getRequestHeaders())) {
            Map<String, String> headerMap = objectMapper.readValue(config.getRequestHeaders(), new TypeReference<Map<String, String>>() {});
            for (Map.Entry<String, String> entry : headerMap.entrySet()) {
                builder.header(entry.getKey(), entry.getValue());
            }
        }

        String method = StringUtils.defaultIfBlank(config.getRequestMethod(), "GET").toUpperCase();
        String body = StringUtils.defaultString(config.getRequestBody());
        switch (method) {
            case "POST":
                builder.POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
                break;
            case "PUT":
                builder.PUT(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
                break;
            case "DELETE":
                if (StringUtils.isBlank(body)) {
                    builder.DELETE();
                } else {
                    builder.method("DELETE", HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
                }
                break;
            default:
                builder.GET();
                break;
        }

        return client.send(builder.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private boolean jsonFieldExists(String body, String fieldPath) {
        try {
            JsonNode current = objectMapper.readTree(body);
            String[] parts = fieldPath.split("\\.");
            for (String part : parts) {
                if (null == current || !current.has(part)) {
                    return false;
                }
                current = current.get(part);
            }
            return null != current && !current.isMissingNode();
        } catch (Exception e) {
            return false;
        }
    }

    private String buildAiReport(ApiPatrolConfig config, ApiPatrolResult result) {
        String prompt = """
                你是一个接口巡检报告助手，请基于以下结构化执行结果生成一份简洁中文报告。
                输出要求：
                1. 先给出总体结论
                2. 再列出异常点
                3. 最后给出建议

                巡检名称：%s
                请求方式：%s
                请求地址：%s
                执行结果：%s
                响应状态码：%s
                响应耗时：%sms
                失败原因：%s
                响应摘要：%s
                """.formatted(
                config.getPatrolName(),
                config.getRequestMethod(),
                config.getRequestUrl(),
                1 == result.getSuccess() ? "成功" : "失败",
                null == result.getResponseCode() ? "-" : result.getResponseCode(),
                null == result.getResponseTime() ? "-" : result.getResponseTime(),
                StringUtils.defaultIfBlank(result.getErrorMessage(), "无"),
                abbreviate(StringUtils.defaultString(result.getResponseBody()), 800)
        );

        try {
            ChatClient chatClient = defaultArmoryStrategyFactory.chatClient(1L);
            String content = chatClient.prompt(prompt).call().content();
            if (StringUtils.isNotBlank(content)) {
                return content;
            }
        } catch (Exception e) {
            log.warn("Generate AI patrol report failed, fallback to local report patrolId={}", config.getId(), e);
        }

        return buildFallbackReport(config, result);
    }

    private String buildFallbackReport(ApiPatrolConfig config, ApiPatrolResult result) {
        StringBuilder builder = new StringBuilder();
        builder.append("总体结论：");
        builder.append(1 == result.getSuccess() ? "本次接口巡检通过。" : "本次接口巡检失败。");
        builder.append("\n");
        builder.append("接口信息：").append(config.getRequestMethod()).append(" ").append(config.getRequestUrl()).append("\n");
        builder.append("状态码：").append(null == result.getResponseCode() ? "-" : result.getResponseCode()).append("\n");
        builder.append("响应耗时：").append(null == result.getResponseTime() ? "-" : result.getResponseTime()).append("ms\n");
        builder.append("异常说明：").append(StringUtils.defaultIfBlank(result.getErrorMessage(), "无")).append("\n");
        builder.append("建议：");
        if (1 == result.getSuccess()) {
            builder.append("当前接口表现正常，可继续观察历史结果趋势。");
        } else {
            builder.append("优先检查接口地址、请求参数、鉴权信息，以及服务端日志中的异常堆栈。");
        }
        return builder.toString();
    }

    private String abbreviate(String value, int maxLength) {
        if (StringUtils.isBlank(value) || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength) + "...";
    }

}



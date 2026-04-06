USE `ai-agent-station`;

-- 最小部署只保留默认流式对话示例，避免启动时预热依赖外部工具服务。
UPDATE ai_agent
SET status = CASE
    WHEN id = 1 THEN 1
    ELSE 0
END;

-- 清空工具绑定，避免预热阶段创建外部 MCP Client。
DELETE FROM ai_client_tool_config;
DELETE FROM ai_client_model_tool_config;

-- 禁用示例定时任务，避免最小部署启动后自动执行无关任务。
UPDATE ai_agent_task_schedule
SET status = 0;

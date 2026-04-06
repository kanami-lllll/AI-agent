# AI Agent Station schema and seed data
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE database if NOT EXISTS `ai-agent-station` default character set utf8mb4 collate utf8mb4_0900_ai_ci;
use `ai-agent-station`;

# 转储表 ai_agent
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_agent`;

CREATE TABLE `ai_agent` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `agent_name` varchar(50) NOT NULL COMMENT '智能体名称',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `channel` varchar(32) DEFAULT NULL COMMENT '渠道类型(agent，chat_stream)',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态(0:禁用,1:启用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_agent_name` (`agent_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI智能体配置表';

LOCK TABLES `ai_agent` WRITE;
/*!40000 ALTER TABLE `ai_agent` DISABLE KEYS */;

INSERT INTO `ai_agent` (`id`, `agent_name`, `description`, `channel`, `status`, `create_time`, `update_time`)
VALUES
	(1,'流式对话示例','基础流式对话示例','chat_stream',1,'2026-01-01 00:00:00','2026-01-01 00:00:00'),
	(2,'通用对话代理','基础对话代理示例','agent',0,'2026-01-01 00:00:00','2026-01-01 00:00:00');

/*!40000 ALTER TABLE `ai_agent` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_agent_client
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_agent_client`;

CREATE TABLE `ai_agent_client` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `agent_id` bigint(20) NOT NULL COMMENT '智能体ID',
  `client_id` bigint(20) NOT NULL COMMENT '客户端ID',
  `sequence` int(11) NOT NULL COMMENT '序列号(执行顺序)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_agent_client_seq` (`agent_id`,`client_id`,`sequence`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='智能体-客户端关联表';

LOCK TABLES `ai_agent_client` WRITE;
/*!40000 ALTER TABLE `ai_agent_client` DISABLE KEYS */;

INSERT INTO `ai_agent_client` (`id`, `agent_id`, `client_id`, `sequence`, `create_time`)
VALUES
	(1,1,1,1,'2026-01-01 00:00:00'),
	(2,2,2,1,'2026-01-01 00:00:00');

/*!40000 ALTER TABLE `ai_agent_client` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_agent_task_schedule
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_agent_task_schedule`;

CREATE TABLE `ai_agent_task_schedule` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `agent_id` bigint(20) NOT NULL COMMENT '智能体ID',
  `task_name` varchar(64) DEFAULT NULL COMMENT '任务名称',
  `description` varchar(255) DEFAULT NULL COMMENT '任务描述',
  `cron_expression` varchar(50) NOT NULL COMMENT '时间表达式(如: 0/3 * * * * *)',
  `task_param` text COMMENT '任务入参配置(JSON格式)',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态(0:无效,1:有效)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_agent_id` (`agent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='智能体任务调度配置表';

LOCK TABLES `ai_agent_task_schedule` WRITE;
/*!40000 ALTER TABLE `ai_agent_task_schedule` DISABLE KEYS */;

-- no seed data

/*!40000 ALTER TABLE `ai_agent_task_schedule` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_client
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_client`;

CREATE TABLE `ai_client` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `client_name` varchar(50) NOT NULL COMMENT '客户端名称',
  `description` varchar(1024) DEFAULT NULL COMMENT '描述',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态(0:禁用,1:启用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_client_name` (`client_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI客户端配置表';

LOCK TABLES `ai_client` WRITE;
/*!40000 ALTER TABLE `ai_client` DISABLE KEYS */;

INSERT INTO `ai_client` (`id`, `client_name`, `description`, `status`, `create_time`, `update_time`)
VALUES
	(1,'流式对话客户端','基础流式对话客户端',1,'2026-01-01 00:00:00','2026-01-01 00:00:00'),
	(2,'通用对话客户端','基础对话客户端',1,'2026-01-01 00:00:00','2026-01-01 00:00:00');

/*!40000 ALTER TABLE `ai_client` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_client_advisor
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_client_advisor`;

CREATE TABLE `ai_client_advisor` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `advisor_name` varchar(50) NOT NULL COMMENT '顾问名称',
  `advisor_type` varchar(50) NOT NULL COMMENT '顾问类型(PromptChatMemory/RagAnswer/SimpleLoggerAdvisor等)',
  `order_num` int(11) DEFAULT '0' COMMENT '顺序号',
  `ext_param` varchar(2048) DEFAULT NULL COMMENT '扩展参数配置，json 记录',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态(0:禁用,1:启用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='顾问配置表';

LOCK TABLES `ai_client_advisor` WRITE;
/*!40000 ALTER TABLE `ai_client_advisor` DISABLE KEYS */;

INSERT INTO `ai_client_advisor` (`id`, `advisor_name`, `advisor_type`, `order_num`, `ext_param`, `status`, `create_time`, `update_time`)
VALUES
	(1,'记忆','ChatMemory',1,'{
    "maxMessages": 200
}',1,'2026-01-01 00:00:00','2026-01-01 00:00:00'),
	(2,'知识库检索','RagAnswer',2,'{
    "topK": "4",
    "filterExpression": "knowledge == ''default''"
}',1,'2026-01-01 00:00:00','2026-01-01 00:00:00');

/*!40000 ALTER TABLE `ai_client_advisor` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_client_advisor_config
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_client_advisor_config`;

CREATE TABLE `ai_client_advisor_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `client_id` bigint(20) NOT NULL COMMENT '客户端ID',
  `advisor_id` bigint(20) NOT NULL COMMENT '顾问ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_client_advisor` (`client_id`,`advisor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户端-顾问关联表';

LOCK TABLES `ai_client_advisor_config` WRITE;
/*!40000 ALTER TABLE `ai_client_advisor_config` DISABLE KEYS */;

INSERT INTO `ai_client_advisor_config` (`id`, `client_id`, `advisor_id`, `create_time`)
VALUES
	(1,2,1,'2026-01-01 00:00:00'),
	(2,2,2,'2026-01-01 00:00:00');

/*!40000 ALTER TABLE `ai_client_advisor_config` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_client_model
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_client_model`;

CREATE TABLE `ai_client_model` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `model_name` varchar(50) NOT NULL COMMENT '模型名称',
  `base_url` varchar(255) NOT NULL COMMENT '基础URL',
  `api_key` varchar(255) NOT NULL COMMENT 'API密钥',
  `completions_path` varchar(100) DEFAULT 'v1/chat/completions' COMMENT '完成路径',
  `embeddings_path` varchar(100) DEFAULT 'v1/embeddings' COMMENT '嵌入路径',
  `model_type` varchar(50) NOT NULL COMMENT '模型类型(openai/azure等)',
  `model_version` varchar(50) DEFAULT 'gpt-4.1' COMMENT '模型版本',
  `timeout` int(11) DEFAULT '180' COMMENT '超时时间(秒)',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态(0:禁用,1:启用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI接口模型配置表';

LOCK TABLES `ai_client_model` WRITE;
/*!40000 ALTER TABLE `ai_client_model` DISABLE KEYS */;

INSERT INTO `ai_client_model` (`id`, `model_name`, `base_url`, `api_key`, `completions_path`, `embeddings_path`, `model_type`, `model_version`, `timeout`, `status`, `create_time`, `update_time`)
VALUES
	(1,'通用对话模型','https://api.openai.com','REPLACE_WITH_ENV_API_KEY','v1/chat/completions','v1/embeddings','openai','gpt-4.1-mini',30,1,'2026-01-01 00:00:00','2026-01-01 00:00:00'),
	(2,'流式对话模型','https://api.openai.com','REPLACE_WITH_ENV_API_KEY','v1/chat/completions','v1/embeddings','openai','gpt-4.1-mini',30,1,'2026-01-01 00:00:00','2026-01-01 00:00:00');

/*!40000 ALTER TABLE `ai_client_model` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_client_model_config
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_client_model_config`;

CREATE TABLE `ai_client_model_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `client_id` bigint(20) NOT NULL COMMENT '客户端ID',
  `model_id` bigint(20) NOT NULL COMMENT '模型ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI客户端，零部件；模型配置';

LOCK TABLES `ai_client_model_config` WRITE;
/*!40000 ALTER TABLE `ai_client_model_config` DISABLE KEYS */;

INSERT INTO `ai_client_model_config` (`id`, `client_id`, `model_id`, `create_time`)
VALUES
	(1,1,2,'2026-01-01 00:00:00'),
	(2,2,1,'2026-01-01 00:00:00');

/*!40000 ALTER TABLE `ai_client_model_config` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_client_model_tool_config
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_client_model_tool_config`;

CREATE TABLE `ai_client_model_tool_config` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `model_id` bigint(20) DEFAULT NULL COMMENT '模型ID',
  `tool_type` varchar(20) DEFAULT NULL COMMENT '工具类型(mcp/function call)',
  `tool_id` bigint(20) DEFAULT NULL COMMENT 'MCP ID/ function call ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI客户端，零部件；模型工具配置';

LOCK TABLES `ai_client_model_tool_config` WRITE;
/*!40000 ALTER TABLE `ai_client_model_tool_config` DISABLE KEYS */;

-- no seed data

/*!40000 ALTER TABLE `ai_client_model_tool_config` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_client_system_prompt
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_client_system_prompt`;

CREATE TABLE `ai_client_system_prompt` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `prompt_name` varchar(50) NOT NULL COMMENT '提示词名称',
  `prompt_content` text NOT NULL COMMENT '提示词内容',
  `description` varchar(1024) DEFAULT NULL COMMENT '描述',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态(0:禁用,1:启用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_prompt_name` (`prompt_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统提示词配置表';

LOCK TABLES `ai_client_system_prompt` WRITE;
/*!40000 ALTER TABLE `ai_client_system_prompt` DISABLE KEYS */;

INSERT INTO `ai_client_system_prompt` (`id`, `prompt_name`, `prompt_content`, `description`, `status`, `create_time`, `update_time`)
VALUES
	(1,'基础对话提示词','你是一个可靠的 AI 助手，请基于用户输入提供准确、简洁、结构清晰的回答。','基础对话提示词',1,'2026-01-01 00:00:00','2026-01-01 00:00:00'),
	(2,'流式对话提示词','你是一个流式对话助手，请基于用户输入持续输出清晰、直接的回答。','流式对话提示词',1,'2026-01-01 00:00:00','2026-01-01 00:00:00');

/*!40000 ALTER TABLE `ai_client_system_prompt` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_client_system_prompt_config
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_client_system_prompt_config`;

CREATE TABLE `ai_client_system_prompt_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `client_id` bigint(20) NOT NULL COMMENT '客户端ID',
  `system_prompt_id` bigint(20) NOT NULL COMMENT '系统提示词ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI客户端，零部件；模型配置';

LOCK TABLES `ai_client_system_prompt_config` WRITE;
/*!40000 ALTER TABLE `ai_client_system_prompt_config` DISABLE KEYS */;

INSERT INTO `ai_client_system_prompt_config` (`id`, `client_id`, `system_prompt_id`, `create_time`)
VALUES
	(1,1,2,'2026-01-01 00:00:00'),
	(2,2,1,'2026-01-01 00:00:00');

/*!40000 ALTER TABLE `ai_client_system_prompt_config` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_client_tool_config
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_client_tool_config`;

CREATE TABLE `ai_client_tool_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `client_id` bigint(20) NOT NULL COMMENT '客户端ID',
  `tool_type` varchar(20) NOT NULL COMMENT '工具类型(mcp/function call)',
  `tool_id` bigint(20) NOT NULL COMMENT 'MCP ID/ function call ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_client_mcp` (`client_id`,`tool_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户端-MCP关联表';

LOCK TABLES `ai_client_tool_config` WRITE;
/*!40000 ALTER TABLE `ai_client_tool_config` DISABLE KEYS */;

-- no seed data

/*!40000 ALTER TABLE `ai_client_tool_config` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_client_tool_mcp
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_client_tool_mcp`;

CREATE TABLE `ai_client_tool_mcp` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `mcp_name` varchar(50) NOT NULL COMMENT 'MCP名称',
  `transport_type` varchar(20) NOT NULL COMMENT '传输类型(sse/stdio)',
  `transport_config` varchar(1024) DEFAULT NULL COMMENT '传输配置(sse/stdio)',
  `request_timeout` int(11) DEFAULT '180' COMMENT '请求超时时间(分钟)',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态(0:禁用,1:启用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_mcp_name` (`mcp_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='MCP客户端配置表';

LOCK TABLES `ai_client_tool_mcp` WRITE;
/*!40000 ALTER TABLE `ai_client_tool_mcp` DISABLE KEYS */;

-- no seed data

/*!40000 ALTER TABLE `ai_client_tool_mcp` ENABLE KEYS */;
UNLOCK TABLES;


# 转储表 ai_rag_order
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ai_rag_order`;

CREATE TABLE `ai_rag_order` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `rag_name` varchar(50) NOT NULL COMMENT '知识库名称',
  `knowledge_tag` varchar(50) NOT NULL COMMENT '知识标签',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态(0:禁用,1:启用)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rag_name` (`rag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库配置表';

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


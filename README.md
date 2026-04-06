# AI Agent Station

AI Agent Station 是一个基于 Spring AI 的配置驱动智能体平台，支持将模型、系统提示词、RAG 知识库、MCP 工具与任务调度能力以配置方式组合，并在运行时装配为可执行的智能体能力。

项目当前提供流式对话、知识库上传与检索、后台配置管理、MCP 工具接入框架以及最小化 Docker 部署方案，适合作为通用 Agent 底座进行业务扩展。

## 核心能力

- 配置驱动装配：将模型、提示词、Advisor、工具和执行顺序拆分为可配置项，在运行时动态装配为 `ChatModel` 与 `ChatClient`
- RAG 知识库：支持文档解析、文本分块、Embedding 向量化、pgvector 存储与相似度检索
- MCP 工具接入：支持通过 `sse` 和 `stdio` 两种方式接入外部工具服务
- 后台配置管理：支持对智能体、模型、提示词、顾问、工具等配置项进行管理
- 任务调度：支持基于配置的定时任务执行框架
- Docker 部署：提供最小可运行的一键部署方案

## 技术栈

- Spring Boot
- Spring AI
- MyBatis
- MySQL
- PostgreSQL + pgvector
- MCP
- Docker Compose

## 项目结构

- `ai-agent-station-app`：应用启动模块与基础配置
- `ai-agent-station-api`：接口定义与统一响应结构
- `ai-agent-station-domain`：核心领域服务与 Agent 装配逻辑
- `ai-agent-station-infrastructure`：DAO、仓储与持久化实现
- `ai-agent-station-trigger`：HTTP 接口与任务调度入口
- `ai-agent-station-types`：公共常量、异常与响应码
- `docs/dev-ops-v2/ai-agent-station-front`：静态前端页面
- `deploy/one-click`：最小化一键部署方案

## 快速开始

推荐使用 `deploy/one-click` 中的最小部署方案启动项目。

### 1. 进入部署目录

```powershell
cd deploy\one-click
```

### 2. 复制环境变量模板

```powershell
Copy-Item .env.example .env
```

### 3. 配置环境变量

至少需要填写以下配置：

```env
SPRING_AI_OPENAI_BASE_URL=https://api.openai.com
SPRING_AI_OPENAI_API_KEY=sk-your-api-key
OPENAI_CHAT_MODEL=gpt-4.1-mini
AI_AGENT_STATION_APP_IMAGE=your-registry/ai-agent-station-app:latest
```

### 4. 启动服务

Windows：

```powershell
./start.ps1
```

Linux / macOS：

```sh
sh ./start.sh
```

### 5. 访问地址

- 前端页面：`http://localhost:8080`
- 后端接口：`http://localhost:8091/ai-agent-station`

如需数据库管理工具：

```powershell
docker compose --profile tools up -d
```

- phpMyAdmin：`http://localhost:8899`
- pgAdmin：`http://localhost:5050`

## 部署说明

最小部署默认启动以下服务：

- MySQL：存储智能体、模型、提示词与后台配置
- PostgreSQL + pgvector：存储知识库向量数据
- `ai-agent-station-app`：后端服务
- `frontend`：静态前端页面

为保证最小环境可稳定启动，初始化脚本默认只保留基础对话与 RAG 相关能力，并禁用依赖外部工具服务的示例数据。

如果修改了模型地址、API Key 或模型名称，建议重新初始化环境：

```powershell
docker compose down -v
docker compose up -d
```

## 默认能力

最小部署默认启用：

- 流式对话
- 后台配置管理
- 知识库上传
- RAG 检索问答

## 许可证

本项目遵循仓库中声明的许可证约束使用。

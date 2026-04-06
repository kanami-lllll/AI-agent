# AI Agent Station 最小部署说明

该目录提供项目的最小可运行部署方案，用于在本地快速启动后端服务、前端页面和必要的数据存储组件。

## 包含的服务

- `mysql`：存储智能体、模型、提示词、任务调度与后台配置
- `pgvector`：存储知识库向量数据
- `ai-agent-station-app`：后端服务
- `frontend`：静态前端页面

## 启动步骤

### 1. 复制环境变量模板

```powershell
Copy-Item .env.example .env
```

### 2. 编辑 `.env`

至少需要配置以下内容：

```env
SPRING_AI_OPENAI_BASE_URL=https://api.openai.com
SPRING_AI_OPENAI_API_KEY=sk-your-api-key
OPENAI_CHAT_MODEL=gpt-4.1-mini
AI_AGENT_STATION_APP_IMAGE=your-registry/ai-agent-station-app:latest
```

说明：

- `SPRING_AI_OPENAI_BASE_URL`：大模型服务地址
- `SPRING_AI_OPENAI_API_KEY`：大模型服务密钥
- `OPENAI_CHAT_MODEL`：默认聊天模型
- `AI_AGENT_STATION_APP_IMAGE`：后端服务镜像名

### 3. 启动环境

Windows：

```powershell
./start.ps1
```

Linux / macOS：

```sh
sh ./start.sh
```

## 访问地址

- 前端页面：`http://localhost:8080`
- 后端接口：`http://localhost:8091/ai-agent-station`

如需数据库管理工具，可额外启动：

```powershell
docker compose --profile tools up -d
```

- phpMyAdmin：`http://localhost:8899`
- pgAdmin：`http://localhost:5050`

## 默认初始化策略

最小部署默认仅保留基础对话与 RAG 相关能力，以避免启动阶段依赖额外的外部工具服务。

初始化后默认具备：

- 流式对话
- 后台配置管理
- 知识库上传
- RAG 检索问答

## 重新初始化

如果修改了模型地址、API Key、模型名称或初始化数据，建议重新初始化环境：

```powershell
docker compose down -v
docker compose up -d
```

## 说明

该部署方案面向本地开发和功能验证场景。若用于正式环境，建议补充镜像发布、反向代理、持久化目录、监控与安全配置。

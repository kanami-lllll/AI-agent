# Docker 一键部署说明

本目录提供 AI Agent Console 的最小 Docker 部署方案，适合本地验证、功能演示和面试项目展示。

默认会启动以下服务：

- MySQL：保存智能体、模型、提示词、工具、任务和接口巡检配置。
- PostgreSQL(pgvector)：保存知识库向量数据。
- ai-agent-station-app：后端服务。
- frontend：Nginx 静态前端页面。
- phpMyAdmin / pgAdmin：可选数据库管理工具。

## 1. 准备环境

需要先安装：

- Docker Desktop
- Git
- 可用的 OpenAI-compatible 模型服务

如果需要使用 RAG 知识库，模型服务需要支持 embedding 接口。

## 2. 创建配置文件

进入部署目录：

```powershell
cd deploy\one-click
```

复制配置模板：

```powershell
Copy-Item .env.example .env
```

Linux / macOS：

```sh
cp .env.example .env
```

## 3. 配置 `.env`

至少需要修改：

```env
SPRING_AI_OPENAI_BASE_URL=https://api.openai.com
SPRING_AI_OPENAI_API_KEY=sk-your-api-key
OPENAI_CHAT_MODEL=gpt-4.1-mini
AI_AGENT_STATION_APP_IMAGE=ai-agent-station-app:local
```

如果你使用的是第三方 OpenAI-compatible 平台，把 `baseUrl`、`apiKey` 和模型名改成对应平台的配置即可。

## 4. 构建本地后端镜像

如果已经有可用镜像，可以直接把 `.env` 中的 `AI_AGENT_STATION_APP_IMAGE` 改成对应镜像名。
如果从源码部署，可以在项目根目录执行：

```powershell
docker run --rm `
  -v "${PWD}:/workspace" `
  -v "$env:USERPROFILE\.m2:/root/.m2" `
  -w /workspace `
  maven:3.9.9-eclipse-temurin-17 `
  mvn -DskipTests package
```

然后构建镜像：

```powershell
docker build -t ai-agent-station-app:local -f ai-agent-station-app/Dockerfile ai-agent-station-app
```

## 5. 启动服务

Windows：

```powershell
.\start.ps1
```

Linux / macOS：

```sh
sh ./start.sh
```

如果需要重新初始化数据库和向量库：

```powershell
docker compose down -v
docker compose up -d
```

## 6. 访问地址

- 前端页面：http://localhost:8080
- 后端接口：http://localhost:8091/ai-agent-station
- 后台管理：http://localhost:8080/admin/index.html
- 接口巡检配置：http://localhost:8080/admin/page/ai-api-patrol.html
- 巡检结果记录：http://localhost:8080/admin/page/ai-api-patrol-result.html

可选工具：

```powershell
docker compose --profile tools up -d
```

- phpMyAdmin：http://localhost:8899
- pgAdmin：http://localhost:5050

## 7. 数据目录

当前 compose 使用宿主机目录保存数据库和日志数据：

```text
E:/docker-data/ai-agent-station/mysql
E:/docker-data/ai-agent-station/pgvector
E:/docker-data/ai-agent-station/log
```

如果你的机器没有 E 盘，可以在 `docker-compose.yml` 中把这几个 `source` 路径改成其他磁盘目录。

## 8. 常见问题

### 启动后没有新表

说明旧 MySQL 数据卷还在。执行：

```powershell
docker compose down -v
docker compose up -d
```

### 知识库上传失败

优先检查模型服务是否支持 `/v1/embeddings`，以及 `.env` 中的 API Key 是否正确。

### 页面没有更新

前端静态资源可能被浏览器缓存，先按 `Ctrl + F5` 强制刷新。

### 模型配置修改后无效

进入后台“当前对话模型”页面确认配置是否保存成功。当前版本支持在线重载当前聊天模型，一般不需要重启容器。

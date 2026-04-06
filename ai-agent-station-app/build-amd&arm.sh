# 构建 amd64 / arm64 多架构镜像
docker buildx build --load --platform linux/amd64,linux/arm64 -t ai-agent-station-app:multiarch -f ./Dockerfile .

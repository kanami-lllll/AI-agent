# 本地构建单架构镜像
docker build -t ai-agent-station-app:local -f ./Dockerfile .

# 如需构建多架构镜像，可使用 buildx：
# docker buildx build --load --platform linux/amd64,linux/arm64 -t ai-agent-station-app:multiarch -f ./Dockerfile .

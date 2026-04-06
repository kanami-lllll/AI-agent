#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "已生成 deploy/one-click/.env，请先填写 SPRING_AI_OPENAI_API_KEY 后重新执行。"
  exit 1
fi

docker compose up -d

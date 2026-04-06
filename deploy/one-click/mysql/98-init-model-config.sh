#!/usr/bin/env bash
set -euo pipefail

if [ -z "${SPRING_AI_OPENAI_BASE_URL:-}" ] || [ -z "${SPRING_AI_OPENAI_API_KEY:-}" ] || [ -z "${OPENAI_CHAT_MODEL:-}" ]; then
  echo "skip ai_client_model init: missing SPRING_AI_OPENAI_BASE_URL / SPRING_AI_OPENAI_API_KEY / OPENAI_CHAT_MODEL"
  exit 0
fi

mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" ai-agent-station <<SQL
UPDATE ai_client_model
SET
  base_url = '${SPRING_AI_OPENAI_BASE_URL}',
  api_key = '${SPRING_AI_OPENAI_API_KEY}',
  model_version = '${OPENAI_CHAT_MODEL}',
  completions_path = 'v1/chat/completions',
  embeddings_path = 'v1/embeddings'
WHERE id IN (1, 2);
SQL

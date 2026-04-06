#!/bin/bash

set -e

REGISTRY="${REGISTRY:-your-registry.example.com}"
NAMESPACE="${NAMESPACE:-your-namespace}"
IMAGE_NAME="${IMAGE_NAME:-ai-agent-station-app}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

if [ -f ".local-config" ]; then
  source .local-config
fi

echo "Logging into registry..."
docker login --username="${REGISTRY_USERNAME}" --password="${REGISTRY_PASSWORD}" "${REGISTRY}"

echo "Tagging image..."
docker tag ${IMAGE_NAME}:local ${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}

echo "Pushing image..."
docker push ${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}

echo "Done."

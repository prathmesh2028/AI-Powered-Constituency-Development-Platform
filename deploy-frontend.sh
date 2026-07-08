#!/bin/bash
# =============================================================
# CivicPrioritize — Frontend Cloud Run Deploy Script
# =============================================================
# Usage:
#   bash deploy-frontend.sh
#
# Prerequisites:
#   - Backend must be deployed FIRST (to obtain BACKEND_URL)
#   - gcloud CLI installed and authenticated
#   - Docker installed
# =============================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────
PROJECT_ID="${GCP_PROJECT_ID:?GCP_PROJECT_ID is required}"
REGION="${GCP_REGION:-asia-south1}"
SERVICE_NAME="civicprioritize-frontend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Backend URL (must be the deployed Cloud Run backend service HTTPS URL)
BACKEND_URL="${BACKEND_URL:?BACKEND_URL is required — run deploy-backend.sh first and paste its URL here}"

# ── Step 1: Authenticate Docker to GCR ────────────────────────
echo "🔐 Authenticating Docker with Google Container Registry..."
gcloud auth configure-docker --quiet

# ── Step 2: Build Docker Image ─────────────────────────────────
echo "🐳 Building frontend Docker image..."
docker build \
  --build-arg BACKEND_URL="${BACKEND_URL}" \
  -t "${IMAGE_NAME}:latest" \
  ./frontend

# ── Step 3: Push to GCR ────────────────────────────────────────
echo "📤 Pushing image to Google Container Registry..."
docker push "${IMAGE_NAME}:latest"

# ── Step 4: Deploy to Cloud Run ────────────────────────────────
echo "🚀 Deploying frontend to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE_NAME}:latest" \
  --platform=managed \
  --region="${REGION}" \
  --allow-unauthenticated \
  --port=3000 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=5 \
  --timeout=60 \
  --set-env-vars="NODE_ENV=production,PORT=3000,HOSTNAME=0.0.0.0" \
  --set-env-vars="BACKEND_URL=${BACKEND_URL}"

echo "✅ Frontend deployed successfully!"
echo "🌐 Public App URL:"
gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --format="value(status.url)"

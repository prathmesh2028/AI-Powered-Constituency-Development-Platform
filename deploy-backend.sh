#!/bin/bash
# =============================================================
# CivicPrioritize — Backend Cloud Run Deploy Script
# =============================================================
# Usage:
#   bash deploy-backend.sh
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - Docker installed
#   - Required env vars set in .env or exported in shell
# =============================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────
PROJECT_ID="${GCP_PROJECT_ID:?GCP_PROJECT_ID is required}"
REGION="${GCP_REGION:-asia-south1}"
SERVICE_NAME="civicprioritize-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# ── Step 1: Authenticate Docker to GCR ────────────────────────
echo "🔐 Authenticating Docker with Google Container Registry..."
gcloud auth configure-docker --quiet

# ── Step 2: Build Docker Image ─────────────────────────────────
echo "🐳 Building backend Docker image..."
docker build -t "${IMAGE_NAME}:latest" ./backend

# ── Step 3: Push to GCR ────────────────────────────────────────
echo "📤 Pushing image to Google Container Registry..."
docker push "${IMAGE_NAME}:latest"

# ── Step 4: Deploy to Cloud Run ────────────────────────────────
echo "🚀 Deploying backend to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE_NAME}:latest" \
  --platform=managed \
  --region="${REGION}" \
  --allow-unauthenticated \
  --port=5000 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=5 \
  --timeout=60 \
  --set-env-vars="NODE_ENV=production,PORT=5000" \
  --set-env-vars="MONGODB_URI=${MONGODB_URI:?MONGODB_URI is required}" \
  --set-env-vars="GEMINI_API_KEY=${GEMINI_API_KEY:?GEMINI_API_KEY is required}" \
  --set-env-vars="CORS_ORIGIN=${CORS_ORIGIN:-https://civicprioritize-frontend-xxxx-xx.a.run.app}"

echo "✅ Backend deployed successfully!"
echo "🌐 Service URL:"
gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --format="value(status.url)"

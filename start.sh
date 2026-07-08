#!/bin/sh
# Backend: always on internal port 5001 (not exposed externally)
PORT=5001 node backend/src/server.js &

# Frontend: Cloud Run injects $PORT at runtime (usually 8080 or 3000)
HOSTNAME=0.0.0.0 node frontend/server.js

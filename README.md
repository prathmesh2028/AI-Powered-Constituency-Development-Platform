<div align="center">

# 🏛️ CivicPrioritize
### AI-Powered Constituency Development Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-blue?logo=google)](https://ai.google.dev)
[![Cloud Run](https://img.shields.io/badge/Cloud%20Run-GCP-orange?logo=google-cloud)](https://cloud.google.com/run)

> A SaaS-grade civic engagement platform that synthesizes citizen grievances, extracts AI-driven priority concerns, and optimizes resource distribution for elected representatives — powered by **Google Gemini 2.0**.

**Built for National AI Hackathon 2026 · Build with AI Code for Communities**

---

[Live Demo](#) · [Report Bug](issues) · [Request Feature](issues)

</div>

---

## 📌 What is CivicPrioritize?

CivicPrioritize bridges the gap between **citizens** and their **elected representatives**. Citizens can report local issues directly. Representatives get an intelligent dashboard with AI-generated summaries, priority scores, and geographic heatmaps — eliminating manual triaging of thousands of reports.

### 👥 Who is it for?

| Role | What they do |
|------|--------------|
| 🏘️ **Citizens** | Submit grievances, track their status by reference ID |
| 🏛️ **MPs / Officials** | View aggregated dashboards, AI briefings, analytics, and constituency maps |

---

## ✨ Key Features

- **🤖 AI-Powered Analysis** — Gemini 2.0 Flash automatically classifies, scores, and summarizes citizen grievances
- **📊 Real-Time Representative Dashboard** — Live metrics: total reports, pending, completed, archived
- **🗺️ Geospatial Hotspot Map** — Leaflet-powered interactive maps showing issue density by location
- **📈 Analytics & Trends** — Recharts-powered category breakdowns and priority rankings
- **🧠 AI Recommendations** — Executive briefings generated on-demand per constituency
- **🔍 Grievance Tracker** — Citizens can track their submission status via a 24-char reference ID
- **🔐 Dual Login Portal** — Separate Citizen portal (mobile-first) and MP official portal
- **🌓 Light / Dark Mode** — Fully adaptive theme with smooth transitions
- **☁️ Cloud-Native** — Deployed on Google Cloud Run with Docker containers

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (SSR + Standalone), TypeScript, Tailwind CSS v4 |
| **UI Components** | Framer Motion, Recharts, React Leaflet, Lucide React |
| **Backend** | Node.js 20, Express.js, ES Modules |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **AI Engine** | Google Gemini 2.0 Flash |
| **Security** | Helmet, express-rate-limit, Zod validation |
| **Deployment** | Google Cloud Run (2 services), Docker multi-stage builds |
| **CI/CD** | Google Cloud Build (`cloudbuild.yaml`) |

---

## 📁 Project Structure

```
AI-Powered-Constituency-Development-Platform/
├── frontend/                    # Next.js 15 application
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── login/page.tsx       # Dual login portal
│   │   ├── submit/page.tsx      # Citizen grievance submission
│   │   ├── track/page.tsx       # Grievance status tracker
│   │   ├── dashboard/page.tsx   # MP representative dashboard
│   │   ├── analytics/page.tsx   # Geospatial analytics
│   │   └── recommendations/     # AI priority recommendations
│   ├── components/
│   │   ├── shared/              # Layout, Navbar, Sidebar, LeafletMap
│   │   └── ui/                  # Button, Card, Badge, Input, etc.
│   ├── lib/api/client.ts        # Centralized API client
│   ├── constants/index.ts       # Constituency geography & config
│   ├── Dockerfile               # Multi-stage production container
│   ├── .env.example             # Frontend environment template
│   └── next.config.ts           # Next.js config with API rewrites
│
├── backend/                     # Express.js REST API
│   ├── src/
│   │   ├── config/              # Environment & DB config
│   │   ├── controllers/         # Route handlers
│   │   ├── middlewares/         # Auth, rate-limiting, validation
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # Express routers (v1 namespace)
│   │   ├── services/            # Business logic & Gemini AI
│   │   ├── app.js               # Express app setup & CORS
│   │   └── server.js            # Entry point & DB connection
│   ├── Dockerfile               # Production container
│   └── .env.example             # Backend environment template
│
├── cloudbuild.yaml              # GCP Cloud Build CI/CD pipeline
├── deploy-backend.sh            # Manual backend deploy script
├── deploy-frontend.sh           # Manual frontend deploy script
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (free tier works)
- Google Gemini API key from [ai.google.dev](https://ai.google.dev)

### 1. Clone the repository

```bash
git clone https://github.com/prathmesh2028/AI-Powered-Constituency-Development-Platform.git
cd AI-Powered-Constituency-Development-Platform
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# Fill in your values in .env:
#   MONGODB_URI=mongodb+srv://...
#   GEMINI_API_KEY=your_key_here
#   CORS_ORIGIN=http://localhost:3000

npm install
npm run dev
# ✅ Backend running at http://localhost:5000
```

### 3. Setup Frontend

```bash
cd frontend
# No .env needed for local — it connects to localhost:5000 by default

npm install
npm run dev
# ✅ Frontend running at http://localhost:3000
```

### 4. Login

| Role | Credentials |
|------|-------------|
| 🏛️ **MP / Official** | Email: `admin@civic.gov` · Password: `admin` |
| 🏘️ **Citizen** | Select constituency + any 10-digit mobile number |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | `development` or `production` | ✅ |
| `PORT` | Server port (default: `5000`) | ✅ |
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `GEMINI_API_KEY` | Google Generative AI API key | ✅ |
| `CORS_ORIGIN` | Allowed frontend URL(s), comma-separated | ✅ |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Next.js server port (default: `3000`) | — |
| `BACKEND_URL` | Backend Cloud Run HTTPS URL (production only) | ✅ (prod) |

---

## 📖 API Documentation

A full **Postman Collection** is included at `backend/Constituency_Dev_Platform.postman_collection.json`.

### Suggestion Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/suggestions` | Submit a new citizen grievance |
| `GET` | `/api/v1/suggestions` | Fetch paginated suggestions |
| `GET` | `/api/v1/suggestions/:id` | Get a single suggestion by ID |
| `PATCH` | `/api/v1/suggestions/:id/status` | Update suggestion status |

### Dashboard Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/dashboard/suggestions?constituency=X` | Real-time constituency analytics |

### AI Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/ai/analyze-suggestion` | Gemini analysis on raw text |
| `GET` | `/api/v1/ai/suggest-priorities?constituency=X` | AI executive briefing |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health status |

---

## ☁️ Deployment on Google Cloud Run

### Architecture

```
GitHub Repository
      ↓
   Docker
      ↓
Google Cloud Run
      ↓
 Public HTTPS URL
```

Two independent Cloud Run services:
- `civicprioritize-backend` → Express API (port 5000)
- `civicprioritize-frontend` → Next.js SSR (port 3000)

### Prerequisites
- GCP project with billing enabled
- `gcloud` CLI installed
- Docker Desktop installed
- MongoDB Atlas cluster (set Network Access to `0.0.0.0/0`)

### Deploy in 4 Steps

**Step 1 — Enable GCP APIs**
```bash
export GCP_PROJECT_ID="your-project-id"
gcloud config set project $GCP_PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com
```

**Step 2 — Store secrets**
```bash
echo -n "your-mongodb-uri" | gcloud secrets create MONGODB_URI --data-file=-
echo -n "your-gemini-key"  | gcloud secrets create GEMINI_API_KEY --data-file=-
echo -n "https://placeholder" | gcloud secrets create CORS_ORIGIN --data-file=-
echo -n "https://placeholder" | gcloud secrets create BACKEND_URL --data-file=-
```

**Step 3 — Deploy backend first**
```bash
export MONGODB_URI="your-uri"
export GEMINI_API_KEY="your-key"
export CORS_ORIGIN="https://placeholder"
bash deploy-backend.sh
# Copy the output URL → https://civicprioritize-backend-xxxx.a.run.app
```

**Step 4 — Deploy frontend**
```bash
export BACKEND_URL="https://civicprioritize-backend-xxxx.a.run.app"
bash deploy-frontend.sh
# Copy the output URL → https://civicprioritize-frontend-xxxx.a.run.app
```

**Step 5 — Update CORS and redeploy backend**
```bash
export CORS_ORIGIN="https://civicprioritize-frontend-xxxx.a.run.app"
bash deploy-backend.sh
```

### Automated CI/CD (Cloud Build)

Connect your GitHub repo in [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers). Every push to `main` will automatically rebuild and redeploy both services using `cloudbuild.yaml`.

---

## 🗺️ Active Constituencies (Demo Data)

The platform ships with realistic seed data across 3 constituencies:

| Constituency | Region | Sample Issues |
|---|---|---|
| Baramati Constituency | Maharashtra | Road repair, water supply, hospital |
| Mumbai North Constituency | Maharashtra | Metro connectivity, flooding, waste |
| Bangalore South Constituency | Karnataka | Traffic, e-governance, lake cleanup |

---

## 🔮 Roadmap

- [ ] JWT-based Role-Based Access Control (RBAC)
- [ ] Real-time WebSocket notifications for status updates
- [ ] Multi-language support (Hindi, Marathi, Kannada)
- [ ] Redis-backed AI request queue (BullMQ)
- [ ] PDF report generation for representatives
- [ ] Mobile PWA for offline citizen submissions

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ for **National AI Hackathon 2026**

Powered by **Google Gemini 2.0** · Deployed on **Google Cloud Run**

</div>
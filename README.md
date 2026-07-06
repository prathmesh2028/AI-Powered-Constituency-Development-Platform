# AI-Powered Constituency Development Platform (Backend)

An intelligent backend built for civic engagement. This platform allows citizens to submit development suggestions, automatically categorizes and scores them using **Google's Gemini 2.0 AI**, and provides real-time dashboards for local representatives to prioritize municipal projects.

## 🚀 Key Features
- **AI-Powered Analysis**: Automatically extracts sentiment, categories, and priority scores from raw citizen text.
- **Real-Time Dashboards**: MongoDB Aggregation pipelines instantly calculate constituency-wide metrics.
- **Enterprise Security**: Zod validation pipelines, IP rate-limiting, and Helmet security headers.
- **Scalable Architecture**: Strict MVC separation, asynchronous error boundaries, and cursor-based pagination.

---

## 📁 Folder Structure
The codebase follows Clean Architecture principles for maximum maintainability:
```
backend/
├── src/
│   ├── config/       # Environment variables & constants
│   ├── controllers/  # Route handlers (Thin layer)
│   ├── middlewares/  # Express middlewares (Zod Validation, Rate Limiting, Uploads)
│   ├── models/       # Mongoose schemas (Database layer)
│   ├── routes/       # Express routers (v1 namespace)
│   ├── schemas/      # Zod validation schemas
│   ├── services/     # Business logic & AI integration (Thick layer)
│   ├── utils/        # Utility functions (catchAsync)
│   ├── app.js        # Express app configuration
│   └── server.js     # Entry point & DB connection
├── .env.example      # Environment variable template
├── render.yaml       # Infrastructure-as-Code for deployment
└── package.json
```

---

## ⚙️ Installation & Running Locally

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the example environment file and fill in your secrets.
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

---

## 🔐 Environment Variables
Your `.env` file must contain the following keys:
- `NODE_ENV`: Set to `development` locally and `production` when deployed.
- `PORT`: Defaults to 5000.
- `MONGODB_URI`: Your MongoDB Atlas connection string.
- `GEMINI_API_KEY`: Google Generative AI key for suggestion analysis.
- `CORS_ORIGIN`: Allowed frontend URL (e.g. `http://localhost:3000`).

---

## 📖 API Documentation (v1)

A complete **Postman Collection** (`Constituency_Dev_Platform.postman_collection.json`) is included in the root directory.

### Core Endpoints
- `POST /api/v1/suggestions` - Submit a new suggestion (Zod Validated).
- `GET /api/v1/suggestions?page=1&limit=20` - Fetch paginated suggestions.
- `PATCH /api/v1/suggestions/:id/status` - Update the status of a project.
- `GET /api/v1/dashboard/suggestions` - Retrieve real-time constituency analytics.

### AI Endpoints
- `POST /api/v1/ai/analyze-suggestion` - Force a Gemini analysis on raw text.
- `POST /api/v1/ai/summarise` - Bulk summarize multiple issues.

---

## ☁️ Deployment

This backend is optimized for deployment on **Render**.
1. We use `render.yaml` for zero-touch Infrastructure-as-Code.
2. In production, ensure you set `NODE_ENV=production`.
3. Add `0.0.0.0/0` to your MongoDB Atlas Network Access whitelist to allow Render's dynamic IPs to connect.

---

## 🔮 Future Improvements
While this platform is highly robust, future scalability features could include:
1. **Event-Driven AI Analysis**: Moving Gemini calls off the main HTTP thread and into a Redis-backed queue (e.g., BullMQ) to reduce latency during submission.
2. **Role-Based Access Control (RBAC)**: Integrating JWTs to strictly separate Citizen access from Representative access.
3. **Persistent Cloud Storage**: Migrating the current local Multer upload strategy to AWS S3 or Cloudinary.
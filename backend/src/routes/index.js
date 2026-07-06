/**
 * Route Index
 *
 * Central barrel file that imports all route modules and mounts them
 * on the Express app. Import this single file in app.js instead of
 * importing each route file individually.
 *
 * @example
 *  // In app.js:
 *  import mountRoutes from "./routes/index.js";
 *  mountRoutes(app);
 */

import issueRoutes from "./issue.routes.js";
import representativeRoutes from "./representative.routes.js";
import aiRoutes from "./ai.routes.js";
import suggestionRoutes from "./suggestion.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import uploadRoutes from "./upload.routes.js";

const mountRoutes = (app) => {
  app.use("/api/v1/issues", issueRoutes);
  app.use("/api/v1/representatives", representativeRoutes);
  app.use("/api/v1/ai", aiRoutes);
  app.use("/api/v1/suggestions", suggestionRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);
  app.use("/api/v1/upload", uploadRoutes);
};

export default mountRoutes;

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

const mountRoutes = (app) => {
  app.use("/api/issues", issueRoutes);
  app.use("/api/representatives", representativeRoutes);
  app.use("/api/ai", aiRoutes);
};

export default mountRoutes;

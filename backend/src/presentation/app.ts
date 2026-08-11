import express, { Application } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import dashboardRoutes from "./routes/dashboard-routes";
import clientRoutes from "./routes/client-routes";
import quoteRoutes from "./routes/quote-routes";
import { errorHandler } from "./middlewares/error-handler";
import { swaggerSpec } from "./swagger/swagger-config";

/**
 * Express Application Setup
 *
 * Configures middleware, routes, Swagger documentation,
 * and the global error handler.
 */
export function createApp(): Application {
  const app = express();

  // --- Global middleware ---
  app.use(cors());
  app.use(express.json());

  // --- Health check ---
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // --- Swagger documentation ---
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
    })
  );

  // --- API routes ---
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/clients", clientRoutes);
  app.use("/api/quotes", quoteRoutes);

  // --- 404 handler ---
  app.use((_req, res) => {
    res.status(404).json({
      error: {
        message: "Route not found",
        statusCode: 404,
      },
    });
  });

  // --- Global error handler (must be last) ---
  app.use(errorHandler);

  return app;
}
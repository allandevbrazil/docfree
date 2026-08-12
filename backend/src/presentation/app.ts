import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import dashboardRoutes from "./routes/dashboard-routes";
import clientRoutes from "./routes/client-routes";
import quoteRoutes from "./routes/quote-routes";
import { AppError, errorHandler } from "./middlewares/error-handler";
import { swaggerSpec } from "./swagger/swagger-config";

/**
 * Express Application Setup
 *
 * Configures middleware, routes, Swagger documentation,
 * and the global error handler.
 */
export function createApp(): Application {
  const app = express();
  const jsonBodyLimit = process.env.JSON_BODY_LIMIT ?? "100kb";
  const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000);
  const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 300);
  const enableSwagger = process.env.ENABLE_SWAGGER !== "false";
  const corsOrigin = process.env.CORS_ORIGIN?.trim();
  const swaggerUser = process.env.SWAGGER_USER?.trim();
  const swaggerPassword = process.env.SWAGGER_PASSWORD?.trim();

  app.disable("x-powered-by");

  // --- Global middleware ---
  app.use(helmet());

  const allowedOrigins = (corsOrigin
    ? corsOrigin.split(",")
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://frontend-chi-six-23.vercel.app",
      ]
  )
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (corsOrigin === "*") {
          callback(null, true);
          return;
        }
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new AppError(403, "CORS origin denied"));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(
    rateLimit({
      windowMs: Number.isFinite(rateLimitWindowMs)
        ? rateLimitWindowMs
        : 15 * 60 * 1000,
      max: Number.isFinite(rateLimitMax) ? rateLimitMax : 300,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        res.status(429).json({
          error: {
            message: "Too many requests, please try again later.",
            statusCode: 429,
          },
        });
      },
    })
  );

  app.use(express.json({ limit: jsonBodyLimit }));

  // --- Health check ---
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // --- Swagger documentation ---
  if (enableSwagger) {
    if (swaggerUser && swaggerPassword) {
      app.use("/api-docs", (req, res, next) => {
        const authorization = req.headers.authorization;

        if (!authorization?.startsWith("Basic ")) {
          res.setHeader("WWW-Authenticate", 'Basic realm="DocPratico API Docs"');
          res.status(401).json({
            error: {
              message: "Unauthorized",
              statusCode: 401,
            },
          });
          return;
        }

        const encoded = authorization.slice("Basic ".length).trim();
        const decoded = Buffer.from(encoded, "base64").toString("utf8");
        const [providedUser, providedPassword] = decoded.split(":");

        if (providedUser !== swaggerUser || providedPassword !== swaggerPassword) {
          res.setHeader("WWW-Authenticate", 'Basic realm="DocPratico API Docs"');
          res.status(401).json({
            error: {
              message: "Unauthorized",
              statusCode: 401,
            },
          });
          return;
        }

        next();
      });
    }

    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customCss: ".swagger-ui .topbar { display: none }",
      })
    );
  }

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
import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lightweight cache headers for truly public GET routes (no auth)
const cacheablePaths = [/^\/api\/events/, /^\/api\/tickets/, /^\/api\/categories/];
app.use((req, res, next) => {
  const isGet = req.method === "GET";
  const isCacheablePath = cacheablePaths.some((re) => re.test(req.path));
  const isAuthenticated = Boolean(req.headers.authorization);

  // Never cache authenticated responses so admins/organizers always see fresh data
  if (isGet && isCacheablePath && !isAuthenticated) {
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  } else if (isGet && isCacheablePath && isAuthenticated) {
    res.set("Cache-Control", "no-store");
  }

  next();
});

// Health check
app.get("/", (req, res) => {
  res.send("API running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/categories", categoryRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running fine." });
});

// 404 handler - MUST come before error handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler - MUST come last
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log("========================================");
  console.log("Event Registration API Started");
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log("========================================");
});
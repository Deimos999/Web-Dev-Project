import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
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

// Lightweight cache headers for public GET routes
const cacheablePaths = [/^\/api\/events/, /^\/api\/tickets/, /^\/api\/categories/];
app.use((req, res, next) => {
  if (req.method === "GET" && cacheablePaths.some((re) => re.test(req.path))) {
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
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
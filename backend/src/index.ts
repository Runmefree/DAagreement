import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import { initializeDatabase } from "./models/database";
import authRoutes from "./routes/authRoutes";
import agreementRoutes from "./routes/agreementRoutes";
import notificationRoutes from "./routes/notificationRoutes";

dotenv.config();

const app = express();

/* =====================================================
   GLOBAL MIDDLEWARE
===================================================== */

// CORS (adjust frontend URL if needed)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://d-agreement.vercel.app",
      "https://dagreement.onrender.com"
    ],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   STATIC FILES
===================================================== */

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* =====================================================
   HEALTH & ROOT ROUTES (REQUIRED FOR RENDER)
===================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Digital Consent & Agreement Tracker API",
    timestamp: new Date().toISOString()
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API is working"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

/* =====================================================
   API ROUTES
===================================================== */

app.use("/api/auth", authRoutes);
app.use("/api/agreements", agreementRoutes);
app.use("/api/notifications", notificationRoutes);

/* =====================================================
   START SERVER (CRITICAL)
===================================================== */

export async function initializeApp() {
  try {
    await initializeDatabase();
    console.log("✅ Database initialized");
    return app;
  } catch (error) {
    console.error("❌ Failed to initialize app:", error);
    process.exit(1);
  }
}

// Initialize on module load
initializeApp();

export default app;

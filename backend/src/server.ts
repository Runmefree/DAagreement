import app, { initializeApp } from "./index";

const PORT = parseInt(process.env.PORT || "5000", 10);

async function startServer() {
  try {
    // Initialize app and database
    await initializeApp();
    
    // Start listening
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './models/database';
import authRoutes from './routes/authRoutes';
import agreementRoutes from './routes/agreementRoutes';
import notificationRoutes from './routes/notificationRoutes';

dotenv.config();

const app = express();
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

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
async function start() {
  try {
    await initializeDatabase();
    console.log('Database initialized');

    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
export default app;

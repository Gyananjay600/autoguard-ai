import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { initDatabase } from './config/db.js';
import DataSimulatorService from './services/dataSimulatorService.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import chartRoutes from './routes/chartRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import simulatorRoutes from './routes/simulatorRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. CORS Configuration for React (Vite)
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Parsers & Logger
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 3. API Health & Status Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'AutoGuard AI REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 4. RESTful Route Mappings
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/charts', chartRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/simulator', simulatorRoutes);

// 5. Error & 404 Handling
app.use(notFoundHandler);
app.use(errorHandler);

// 6. Server Bootstrap
async function startServer() {
  try {
    // Initialize MySQL Database Schema & Seed Data
    await initDatabase();

    // Start background IoT simulator (every 30 seconds)
    const simInterval = parseInt(process.env.SIMULATOR_INTERVAL_SECONDS || '30', 10);
    DataSimulatorService.startScheduler(simInterval);

    app.listen(PORT, () => {
      console.log(`======================================================`);
      console.log(`🚀 AutoGuard AI Backend running at: http://localhost:${PORT}`);
      console.log(`📡 CORS allowed for React frontend: ${CLIENT_URL}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log(`======================================================`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

startServer();

import { Router } from 'express';
import ChartController from '../controllers/chartController.js';
import { authenticateToken, verifyVehicleOwnership } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/vehicle/:id/sensors', verifyVehicleOwnership, ChartController.getSensorChartData);

export default router;

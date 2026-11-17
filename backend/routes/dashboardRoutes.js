import { Router } from 'express';
import DashboardController from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, DashboardController.getDashboard);

export default router;

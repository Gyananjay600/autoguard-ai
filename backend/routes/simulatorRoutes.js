import { Router } from 'express';
import SimulatorController from '../controllers/simulatorController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/status', SimulatorController.getStatus);
router.post('/toggle', SimulatorController.toggle);

export default router;

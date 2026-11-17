import { Router } from 'express';
import PredictionController from '../controllers/predictionController.js';
import { authenticateToken, verifyVehicleOwnership } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.post('/:vehicleId/quick', verifyVehicleOwnership, PredictionController.runQuickAnalysis);
router.post('/:vehicleId/deep', verifyVehicleOwnership, PredictionController.runDeepDiagnostic);
router.get('/vehicle/:vehicleId', verifyVehicleOwnership, PredictionController.getPredictionsByVehicle);

export default router;

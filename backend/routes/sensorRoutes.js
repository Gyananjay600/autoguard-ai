import { Router } from 'express';
import SensorController from '../controllers/sensorController.js';
import { authenticateToken, verifyVehicleOwnership } from '../middleware/auth.js';
import { validateSensorUpload } from '../middleware/validator.js';

const router = Router();

router.use(authenticateToken);

router.post('/upload', validateSensorUpload, verifyVehicleOwnership, SensorController.uploadReading);
router.get('/vehicle/:vehicleId', verifyVehicleOwnership, SensorController.getVehicleReadings);

export default router;

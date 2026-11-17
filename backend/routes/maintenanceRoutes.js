import { Router } from 'express';
import MaintenanceController from '../controllers/maintenanceController.js';
import { authenticateToken, verifyVehicleOwnership } from '../middleware/auth.js';
import { validateMaintenance } from '../middleware/validator.js';

const router = Router();

router.use(authenticateToken);

router.post('/save', validateMaintenance, verifyVehicleOwnership, MaintenanceController.saveMaintenance);
router.post('/:id/done', verifyVehicleOwnership, MaintenanceController.markDone);
router.get('/vehicle/:vehicleId', verifyVehicleOwnership, MaintenanceController.getByVehicle);

export default router;

import { Router } from 'express';
import VehicleController from '../controllers/vehicleController.js';
import { authenticateToken, verifyVehicleOwnership } from '../middleware/auth.js';
import { validateVehicle } from '../middleware/validator.js';

const router = Router();

// Apply auth to all vehicle routes
router.use(authenticateToken);

router.get('/', VehicleController.listVehicles);
router.post('/', validateVehicle, VehicleController.createVehicle);

// Parameterized routes with ownership verification
router.get('/:id', verifyVehicleOwnership, VehicleController.getVehicleDetail);
router.put('/:id', verifyVehicleOwnership, validateVehicle, VehicleController.updateVehicle);
router.delete('/:id', verifyVehicleOwnership, VehicleController.deleteVehicle);

// Simulator triggers
router.post('/:id/simulate', verifyVehicleOwnership, VehicleController.simulateReading);
router.post('/:id/simulate/history', verifyVehicleOwnership, VehicleController.generateHistory);
router.post('/:id/inject-anomaly', verifyVehicleOwnership, VehicleController.injectAnomaly);

export default router;

import VehicleService from '../services/vehicleService.js';
import SensorService from '../services/sensorService.js';
import MaintenanceService from '../services/maintenanceService.js';
import AlertService from '../services/alertService.js';
import DataSimulatorService from '../services/dataSimulatorService.js';

export class VehicleController {
  /**
   * GET /api/vehicles
   * Lists vehicles based on role scoping
   */
  static async listVehicles(req, res, next) {
    try {
      const currentUser = req.user;
      let vehicles;

      if (currentUser.role === 'ADMIN' || currentUser.role === 'ENGINEER') {
        vehicles = await VehicleService.getAllVehicles();
      } else {
        vehicles = await VehicleService.getVehiclesByUser(currentUser.id);
      }

      res.status(200).json({
        success: true,
        count: vehicles.length,
        vehicles
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/vehicles/:id
   * Complete vehicle detail, latest 50 readings, maintenance records, and fault predictions
   */
  static async getVehicleDetail(req, res, next) {
    try {
      const id = req.params.id;
      const vehicle = await VehicleService.findById(id);
      const sensorReadings = await SensorService.getLatest50(id);
      const maintenanceRecords = await MaintenanceService.getByVehicle(id);
      const alerts = await AlertService.getAlertsByVehicle(id);

      res.status(200).json({
        success: true,
        vehicle,
        sensorReadings,
        maintenanceRecords,
        alerts
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/vehicles
   * Add vehicle and auto-generate 20 initial historical readings
   */
  static async createVehicle(req, res, next) {
    try {
      const currentUser = req.user;
      const vehicle = await VehicleService.save(req.body, currentUser.id);

      // Generate initial historical data (matches Java DataSimulatorService)
      await DataSimulatorService.generateHistoricalData(vehicle.id);

      res.status(201).json({
        success: true,
        message: `Vehicle '${vehicle.name}' registered successfully with 20 historical telemetry readings.`,
        vehicle
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/vehicles/:id
   */
  static async updateVehicle(req, res, next) {
    try {
      const id = req.params.id;
      const updated = await VehicleService.update(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Vehicle specs updated successfully.',
        vehicle: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/vehicles/:id
   */
  static async deleteVehicle(req, res, next) {
    try {
      const id = req.params.id;
      await VehicleService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/vehicles/:id/simulate
   * Simulates one single reading
   */
  static async simulateReading(req, res, next) {
    try {
      const id = req.params.id;
      const vehicle = await VehicleService.findById(id);
      const reading = await DataSimulatorService.simulateForVehicle(vehicle);

      res.status(201).json({
        success: true,
        message: 'Simulated one telemetry reading successfully.',
        reading
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/vehicles/:id/simulate/history
   * Generates 20 historical readings
   */
  static async generateHistory(req, res, next) {
    try {
      const id = req.params.id;
      await VehicleService.findById(id);
      const readings = await DataSimulatorService.generateHistoricalData(id);

      res.status(201).json({
        success: true,
        message: 'Generated 20 historical telemetry readings successfully.',
        count: readings.length
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/vehicles/:id/inject-anomaly
   * Injects an intentional sensor anomaly (Overheating, Low Oil, High Vibration, etc.)
   */
  static async injectAnomaly(req, res, next) {
    try {
      const id = req.params.id;
      const { anomalyType } = req.body;
      const vehicle = await VehicleService.findById(id);

      const reading = await DataSimulatorService.simulateForVehicle(vehicle, anomalyType);

      res.status(201).json({
        success: true,
        message: `Injected telemetry anomaly: ${anomalyType || 'STANDARD'}`,
        reading
      });
    } catch (err) {
      next(err);
    }
  }
}

export default VehicleController;

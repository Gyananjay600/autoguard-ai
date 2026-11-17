import SensorService from '../services/sensorService.js';
import VehicleService from '../services/vehicleService.js';

export class SensorController {
  /**
   * POST /api/sensors/upload
   * Save a single telemetry reading
   */
  static async uploadReading(req, res, next) {
    try {
      const { vehicleId, timestamp, rpm, engineTemp, oilPressure, vibration, errorCode } = req.body;

      const reading = await SensorService.save({
        vehicleId,
        timestamp,
        rpm,
        engineTemp,
        oilPressure,
        vibration,
        errorCode
      });

      res.status(201).json({
        success: true,
        message: 'Telemetry reading saved successfully.',
        reading
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/sensors/vehicle/:vehicleId
   * Retrieve all or latest readings for a vehicle
   */
  static async getVehicleReadings(req, res, next) {
    try {
      const vehicleId = req.params.vehicleId;
      const limit = req.query.limit === 'all' ? false : true;

      const readings = limit
        ? await SensorService.getLatest50(vehicleId)
        : await SensorService.getReadingsByVehicle(vehicleId);

      res.status(200).json({
        success: true,
        count: readings.length,
        readings
      });
    } catch (err) {
      next(err);
    }
  }
}

export default SensorController;

import MaintenanceService from '../services/maintenanceService.js';

export class MaintenanceController {
  /**
   * POST /api/maintenance/save
   */
  static async saveMaintenance(req, res, next) {
    try {
      const { vehicleId, action, notes } = req.body;
      const record = await MaintenanceService.save(vehicleId, action, notes);

      res.status(201).json({
        success: true,
        message: 'Maintenance record logged successfully.',
        record
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/maintenance/:id/done
   */
  static async markDone(req, res, next) {
    try {
      const id = req.params.id;
      const { vehicleId } = req.body;
      const record = await MaintenanceService.markRepairDone(id, vehicleId);

      res.status(200).json({
        success: true,
        message: 'Repair successfully marked as completed.',
        record
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/maintenance/vehicle/:vehicleId
   */
  static async getByVehicle(req, res, next) {
    try {
      const vehicleId = req.params.vehicleId;
      const records = await MaintenanceService.getByVehicle(vehicleId);

      res.status(200).json({
        success: true,
        count: records.length,
        records
      });
    } catch (err) {
      next(err);
    }
  }
}

export default MaintenanceController;

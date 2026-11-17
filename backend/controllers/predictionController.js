import PredictionService from '../services/predictionService.js';
import AlertService from '../services/alertService.js';

export class PredictionController {
  /**
   * POST /api/predictions/:vehicleId/quick
   */
  static async runQuickAnalysis(req, res, next) {
    try {
      const vehicleId = req.params.vehicleId;
      const result = await PredictionService.runQuickAnalysis(vehicleId);

      res.status(200).json({
        success: true,
        message: 'Quick AI analysis generated successfully.',
        result
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: `Failed to execute Quick AI analysis: ${err.message}`
      });
    }
  }

  /**
   * POST /api/predictions/:vehicleId/deep
   */
  static async runDeepDiagnostic(req, res, next) {
    try {
      const vehicleId = req.params.vehicleId;
      const result = await PredictionService.runDeepDiagnostic(vehicleId);

      res.status(200).json({
        success: true,
        message: 'Deep AI diagnostic generated successfully.',
        result
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: `Failed to execute Deep AI diagnostic: ${err.message}`
      });
    }
  }

  /**
   * GET /api/predictions/vehicle/:vehicleId
   */
  static async getPredictionsByVehicle(req, res, next) {
    try {
      const vehicleId = req.params.vehicleId;
      const alerts = await AlertService.getAlertsByVehicle(vehicleId);

      res.status(200).json({
        success: true,
        count: alerts.length,
        alerts
      });
    } catch (err) {
      next(err);
    }
  }
}

export default PredictionController;

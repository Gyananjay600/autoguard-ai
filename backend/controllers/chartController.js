import SensorService from '../services/sensorService.js';

export class ChartController {
  /**
   * GET /api/charts/vehicle/:id/sensors
   * Matches Java ChartController: returns chronological series of last 50 readings
   */
  static async getSensorChartData(req, res, next) {
    try {
      const id = req.params.id;
      const chartData = await SensorService.getChartData(id);

      res.status(200).json(chartData);
    } catch (err) {
      next(err);
    }
  }
}

export default ChartController;

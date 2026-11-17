import DataSimulatorService from '../services/dataSimulatorService.js';

export class SimulatorController {
  /**
   * GET /api/simulator/status
   */
  static getStatus(req, res) {
    res.status(200).json({
      success: true,
      isRunning: DataSimulatorService.isRunning
    });
  }

  /**
   * POST /api/simulator/toggle
   */
  static toggle(req, res) {
    const { enable, intervalSeconds } = req.body;

    if (enable) {
      DataSimulatorService.startScheduler(intervalSeconds || 30);
    } else {
      DataSimulatorService.stopScheduler();
    }

    res.status(200).json({
      success: true,
      isRunning: DataSimulatorService.isRunning,
      message: DataSimulatorService.isRunning
        ? 'Background telemetry simulator started.'
        : 'Background telemetry simulator stopped.'
    });
  }
}

export default SimulatorController;

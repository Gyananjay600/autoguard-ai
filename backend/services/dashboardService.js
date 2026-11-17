import VehicleService from './vehicleService.js';
import AlertService from './alertService.js';

export class DashboardService {
  /**
   * Builds summary metrics for fleet / personal dashboard
   */
  static async getSummary(user, canViewAllVehicles) {
    const isTeamView = canViewAllVehicles;

    const highRisk = isTeamView
      ? await AlertService.countHighRisk()
      : await AlertService.countByRiskLevelForUser('HIGH', user.id);

    const mediumRisk = isTeamView
      ? await AlertService.countMediumRisk()
      : await AlertService.countByRiskLevelForUser('MEDIUM', user.id);

    const lowRisk = isTeamView
      ? await AlertService.countLowRisk()
      : await AlertService.countByRiskLevelForUser('LOW', user.id);

    const totalVehicles = isTeamView
      ? await VehicleService.countAll()
      : await VehicleService.countByUser(user.id);

    return {
      totalVehicles,
      highRiskCount: highRisk,
      mediumRiskCount: mediumRisk,
      lowRiskCount: lowRisk,
      totalAlerts: highRisk + mediumRisk + lowRisk
    };
  }
}

export default DashboardService;

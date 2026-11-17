import DashboardService from '../services/dashboardService.js';
import VehicleService from '../services/vehicleService.js';

export class DashboardController {
  /**
   * GET /api/dashboard
   * Returns summary counts, vehicles list, and view scope flag
   */
  static async getDashboard(req, res, next) {
    try {
      const currentUser = req.user;
      const canViewAllVehicles = currentUser.role === 'ADMIN' || currentUser.role === 'ENGINEER';

      const summary = await DashboardService.getSummary(currentUser, canViewAllVehicles);

      let vehicles;
      if (currentUser.role === 'OWNER') {
        vehicles = await VehicleService.getVehiclesByUser(currentUser.id);
      } else {
        vehicles = await VehicleService.getAllVehicles();
      }

      res.status(200).json({
        success: true,
        summary,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role
        },
        showingAllVehicles: canViewAllVehicles,
        vehicles
      });
    } catch (err) {
      next(err);
    }
  }
}

export default DashboardController;

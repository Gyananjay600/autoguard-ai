import { query } from '../config/db.js';

export class AlertService {
  /**
   * Get fault predictions / alerts by vehicle with AI explanations attached
   */
  static async getAlertsByVehicle(vehicleId) {
    const predictions = await query(
      'SELECT * FROM fault_predictions WHERE vehicle_id = ? ORDER BY created_at DESC',
      [vehicleId]
    );

    for (const pred of predictions) {
      pred.explanations = await query(
        'SELECT * FROM ai_explanations WHERE prediction_id = ? ORDER BY created_at DESC',
        [pred.id]
      );
    }

    return predictions;
  }

  /**
   * Get high risk alerts across fleet
   */
  static async getHighRiskAlerts() {
    return await query(`
      SELECT fp.*, v.name as vehicle_name, v.make, v.model, v.vin
      FROM fault_predictions fp
      JOIN vehicles v ON fp.vehicle_id = v.id
      WHERE fp.risk_level = 'HIGH'
      ORDER BY fp.created_at DESC
    `);
  }

  static async countHighRisk() {
    const rows = await query("SELECT COUNT(*) as count FROM fault_predictions WHERE risk_level = 'HIGH'");
    return rows[0]?.count || 0;
  }

  static async countMediumRisk() {
    const rows = await query("SELECT COUNT(*) as count FROM fault_predictions WHERE risk_level = 'MEDIUM'");
    return rows[0]?.count || 0;
  }

  static async countLowRisk() {
    const rows = await query("SELECT COUNT(*) as count FROM fault_predictions WHERE risk_level = 'LOW'");
    return rows[0]?.count || 0;
  }

  static async countByRiskLevelForUser(riskLevel, userId) {
    const rows = await query(`
      SELECT COUNT(*) as count 
      FROM fault_predictions fp
      JOIN vehicles v ON fp.vehicle_id = v.id
      WHERE fp.risk_level = ? AND v.user_id = ?
    `, [riskLevel, userId]);
    return rows[0]?.count || 0;
  }
}

export default AlertService;

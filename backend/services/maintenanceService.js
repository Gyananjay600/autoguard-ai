import { query } from '../config/db.js';

export class MaintenanceService {
  /**
   * Log a new maintenance record
   */
  static async save(vehicleId, action, notes) {
    const today = new Date().toISOString().split('T')[0];
    const result = await query(
      `INSERT INTO maintenance_records (vehicle_id, date, action, notes, repair_done)
       VALUES (?, ?, ?, ?, FALSE)`,
      [vehicleId, today, action, notes || '']
    );

    const rows = await query('SELECT * FROM maintenance_records WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  /**
   * Get maintenance history by vehicle ID ordered by date descending
   */
  static async getByVehicle(vehicleId) {
    return await query(
      'SELECT * FROM maintenance_records WHERE vehicle_id = ? ORDER BY date DESC, id DESC',
      [vehicleId]
    );
  }

  /**
   * Mark a maintenance record as completed/repaired
   */
  static async markRepairDone(recordId, vehicleId) {
    const rows = await query('SELECT * FROM maintenance_records WHERE id = ?', [recordId]);
    if (!rows || rows.length === 0) {
      throw new Error(`Maintenance record not found with ID: ${recordId}`);
    }

    const record = rows[0];
    if (Number(record.vehicle_id) !== Number(vehicleId)) {
      throw new Error('Maintenance record does not belong to this vehicle.');
    }

    await query('UPDATE maintenance_records SET repair_done = TRUE WHERE id = ?', [recordId]);
    const updated = await query('SELECT * FROM maintenance_records WHERE id = ?', [recordId]);
    return updated[0];
  }
}

export default MaintenanceService;

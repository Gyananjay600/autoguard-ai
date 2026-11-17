import { query } from '../config/db.js';

export class VehicleService {
  /**
   * Save a new vehicle
   */
  static async save(vehicleData, userId) {
    const result = await query(
      `INSERT INTO vehicles (name, make, model, year, mileage, engine_type, vin, user_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        vehicleData.name,
        vehicleData.make,
        vehicleData.model,
        vehicleData.year || 2024,
        vehicleData.mileage || 0,
        vehicleData.engineType || vehicleData.engine_type || 'Standard',
        vehicleData.vin || null,
        userId
      ]
    );

    return await this.findById(result.insertId);
  }

  /**
   * Retrieve all vehicles with owner information
   */
  static async getAllVehicles() {
    return await query(`
      SELECT v.*, u.name as owner_name, u.email as owner_email,
        (SELECT risk_level FROM fault_predictions WHERE vehicle_id = v.id ORDER BY created_at DESC LIMIT 1) as latest_risk_level,
        (SELECT risk_score FROM fault_predictions WHERE vehicle_id = v.id ORDER BY created_at DESC LIMIT 1) as latest_risk_score,
        (SELECT predicted_fault_type FROM fault_predictions WHERE vehicle_id = v.id ORDER BY created_at DESC LIMIT 1) as latest_fault_type
      FROM vehicles v
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY v.id DESC
    `);
  }

  /**
   * Retrieve vehicles belonging to a specific user
   */
  static async getVehiclesByUser(userId) {
    return await query(`
      SELECT v.*, u.name as owner_name, u.email as owner_email,
        (SELECT risk_level FROM fault_predictions WHERE vehicle_id = v.id ORDER BY created_at DESC LIMIT 1) as latest_risk_level,
        (SELECT risk_score FROM fault_predictions WHERE vehicle_id = v.id ORDER BY created_at DESC LIMIT 1) as latest_risk_score,
        (SELECT predicted_fault_type FROM fault_predictions WHERE vehicle_id = v.id ORDER BY created_at DESC LIMIT 1) as latest_fault_type
      FROM vehicles v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.user_id = ?
      ORDER BY v.id DESC
    `, [userId]);
  }

  /**
   * Find vehicle by ID with user info
   */
  static async findById(id) {
    const rows = await query(`
      SELECT v.*, u.name as owner_name, u.email as owner_email 
      FROM vehicles v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.id = ?
    `, [id]);

    if (!rows || rows.length === 0) {
      throw new Error(`Vehicle not found with ID: ${id}`);
    }
    return rows[0];
  }

  /**
   * Update vehicle
   */
  static async update(id, updated) {
    await this.findById(id);

    await query(
      `UPDATE vehicles 
       SET name = ?, make = ?, model = ?, year = ?, mileage = ?, engine_type = ?, vin = ?
       WHERE id = ?`,
      [
        updated.name,
        updated.make,
        updated.model,
        updated.year,
        updated.mileage,
        updated.engineType || updated.engine_type,
        updated.vin,
        id
      ]
    );

    return await this.findById(id);
  }

  /**
   * Delete vehicle
   */
  static async delete(id) {
    await this.findById(id);
    await query('DELETE FROM vehicles WHERE id = ?', [id]);
    return { success: true };
  }

  /**
   * Total count of all vehicles
   */
  static async countAll() {
    const rows = await query('SELECT COUNT(*) as count FROM vehicles');
    return rows[0]?.count || 0;
  }

  /**
   * Total count of vehicles by user
   */
  static async countByUser(userId) {
    const rows = await query('SELECT COUNT(*) as count FROM vehicles WHERE user_id = ?', [userId]);
    return rows[0]?.count || 0;
  }
}

export default VehicleService;

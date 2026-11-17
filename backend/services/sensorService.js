import { query } from '../config/db.js';

export class SensorService {
  /**
   * Insert new sensor reading
   */
  static async save({ vehicleId, timestamp, rpm, engineTemp, oilPressure, vibration, errorCode }) {
    const ts = timestamp ? new Date(timestamp) : new Date();
    const result = await query(
      `INSERT INTO sensor_readings (vehicle_id, timestamp, rpm, engine_temp, oil_pressure, vibration, error_code)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vehicleId, ts, rpm || null, engineTemp || null, oilPressure || null, vibration || null, errorCode || null]
    );

    const rows = await query('SELECT * FROM sensor_readings WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  /**
   * Get all readings for vehicle ordered by timestamp desc
   */
  static async getReadingsByVehicle(vehicleId) {
    return await query(
      'SELECT * FROM sensor_readings WHERE vehicle_id = ? ORDER BY timestamp DESC',
      [vehicleId]
    );
  }

  /**
   * Get latest 50 readings for vehicle
   */
  static async getLatest50(vehicleId) {
    return await query(
      'SELECT * FROM sensor_readings WHERE vehicle_id = ? ORDER BY timestamp DESC LIMIT 50',
      [vehicleId]
    );
  }

  /**
   * Get formatted sensor chart data (oldest to newest for continuous line rendering)
   */
  static async getChartData(vehicleId) {
    const rows = await this.getLatest50(vehicleId);
    // Reverse to show oldest first on timeline chart
    const chronological = [...rows].reverse();

    const labels = chronological.map(r => {
      if (!r.timestamp) return '';
      const date = new Date(r.timestamp);
      return date.toTimeString().substring(0, 8);
    });

    const engineTemp = chronological.map(r => Number(r.engine_temp || 0));
    const rpm = chronological.map(r => Number(r.rpm || 0));
    const oilPressure = chronological.map(r => Number(r.oil_pressure || 0));
    const vibration = chronological.map(r => Number(r.vibration || 0));

    return {
      labels,
      engineTemp,
      rpm,
      oilPressure,
      vibration,
      count: rows.length
    };
  }
}

export default SensorService;

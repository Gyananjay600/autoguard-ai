import { query } from '../config/db.js';

export class DataSimulatorService {
  static timer = null;
  static isRunning = false;

  /**
   * Start recurring background simulation every N seconds
   */
  static startScheduler(intervalSeconds = 30) {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log(`[SIMULATOR] Telemetry simulation loop active (Interval: ${intervalSeconds}s)`);

    this.timer = setInterval(async () => {
      try {
        await this.simulateAllVehicles();
      } catch (err) {
        console.error('[SIMULATOR] Error during background cycle:', err.message);
      }
    }, intervalSeconds * 1000);
  }

  /**
   * Stop recurring background simulation
   */
  static stopScheduler() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[SIMULATOR] Telemetry simulation paused.');
  }

  /**
   * Simulates telemetry readings across all registered vehicles
   */
  static async simulateAllVehicles() {
    const vehicles = await query('SELECT * FROM vehicles');
    if (!vehicles || vehicles.length === 0) return;

    for (const vehicle of vehicles) {
      await this.simulateForVehicle(vehicle);
    }
  }

  /**
   * Generates single realistic telemetry reading for a vehicle
   */
  static async simulateForVehicle(vehicle, anomalyType = null) {
    const reading = this.generateReading(vehicle.id, anomalyType);

    const result = await query(
      `INSERT INTO sensor_readings (vehicle_id, timestamp, rpm, engine_temp, oil_pressure, vibration, error_code)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        reading.vehicleId,
        reading.timestamp,
        reading.rpm,
        reading.engineTemp,
        reading.oilPressure,
        reading.vibration,
        reading.errorCode
      ]
    );

    return {
      id: result.insertId,
      ...reading
    };
  }

  /**
   * Generates 20 historical readings spread over the past 100 minutes
   */
  static async generateHistoricalData(vehicleId) {
    const readings = [];
    const now = Date.now();

    for (let i = 20; i >= 1; i--) {
      const historicalTime = new Date(now - i * 5 * 60 * 1000);
      const reading = this.generateReading(vehicleId, null, historicalTime);

      await query(
        `INSERT INTO sensor_readings (vehicle_id, timestamp, rpm, engine_temp, oil_pressure, vibration, error_code)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          reading.vehicleId,
          reading.timestamp,
          reading.rpm,
          reading.engineTemp,
          reading.oilPressure,
          reading.vibration,
          reading.errorCode
        ]
      );

      readings.push(reading);
    }

    return readings;
  }

  /**
   * Core generator reproducing exact random distributions from DataSimulatorService.java
   */
  static generateReading(vehicleId, anomalyType = null, customTimestamp = null) {
    const timestamp = customTimestamp || new Date();

    let engineTemp = this.generateEngineTemp();
    let oilPressure = this.generateOilPressure();
    let rpm = this.generateRpm();
    let vibration = this.generateVibration();
    let errorCode = this.generateErrorCode(engineTemp, oilPressure);

    // Apply specific anomaly injection if requested
    if (anomalyType === 'OVERHEATING') {
      engineTemp = this.round(108 + Math.random() * 10);
      errorCode = 'P0217';
    } else if (anomalyType === 'LOW_OIL') {
      oilPressure = this.round(8 + Math.random() * 8);
      errorCode = 'P0520';
    } else if (anomalyType === 'HIGH_VIBRATION') {
      vibration = this.round(1.8 + Math.random() * 1.5);
    } else if (anomalyType === 'HIGH_RPM') {
      rpm = this.round(5800 + Math.random() * 1500);
    } else if (anomalyType === 'MISFIRE_DTC') {
      errorCode = 'P0300';
    }

    return {
      vehicleId,
      timestamp,
      rpm,
      engineTemp,
      oilPressure,
      vibration,
      errorCode
    };
  }

  static generateEngineTemp() {
    const chance = Math.floor(Math.random() * 100);
    if (chance < 5) return this.round(105 + Math.random() * 10); // high spike
    if (chance < 15) return this.round(96 + Math.random() * 8);  // warm
    return this.round(80 + Math.random() * 15);                  // normal 80-95°C
  }

  static generateOilPressure() {
    const chance = Math.floor(Math.random() * 100);
    if (chance < 5) return this.round(8 + Math.random() * 12);   // critically low
    if (chance < 12) return this.round(20 + Math.random() * 10); // low warning
    return this.round(35 + Math.random() * 30);                  // normal 35-65 PSI
  }

  static generateRpm() {
    const chance = Math.floor(Math.random() * 100);
    if (chance < 5) return this.round(5000 + Math.random() * 2000); // high RPM
    return this.round(800 + Math.random() * 3200);                  // normal 800-4000
  }

  static generateVibration() {
    const chance = Math.floor(Math.random() * 100);
    if (chance < 5) return this.round(2.0 + Math.random() * 1.5);   // high vibration
    if (chance < 15) return this.round(0.8 + Math.random() * 0.8);  // medium
    return this.round(0.1 + Math.random() * 0.4);                   // normal 0.1-0.5
  }

  static generateErrorCode(temp, oil) {
    if (temp > 105) return 'P0217'; // Engine Over Temperature
    if (temp > 100) return 'P0128'; // Thermostat Rationality
    if (oil < 15) return 'P0520';   // Engine Oil Pressure Sensor/Switch
    if (oil < 25) return 'P0521';   // Engine Oil Pressure Range/Performance
    if (Math.random() < 0.05) {
      const codes = ['P0300', 'P0301', 'P0171', 'P0420', 'P0442'];
      return codes[Math.floor(Math.random() * codes.length)];
    }
    return null;
  }

  static round(val) {
    return Math.round(val * 10.0) / 10.0;
  }
}

export default DataSimulatorService;

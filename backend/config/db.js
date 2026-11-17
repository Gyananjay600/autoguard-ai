import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'autoguard_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

/**
 * Execute a query with parameters
 */
export async function query(sql, params = []) {
  const [results] = await pool.execute(sql, params);
  return results;
}

/**
 * Auto-initialize database tables and initial seed data if not present
 */
export async function initDatabase() {
  try {
    // Test connectivity
    const connection = await pool.getConnection();
    console.log(`[DB] Connected successfully to MySQL at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'autoguard_db'}`);
    connection.release();

    // 1. Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('OWNER', 'ENGINEER', 'ADMIN') NOT NULL DEFAULT 'OWNER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Vehicles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        make VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        year INT NOT NULL,
        mileage INT NOT NULL,
        engine_type VARCHAR(255),
        vin VARCHAR(255) UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id BIGINT NOT NULL,
        CONSTRAINT fk_vehicle_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_vehicle_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Sensor Readings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sensor_readings (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        rpm DOUBLE,
        engine_temp DOUBLE,
        oil_pressure DOUBLE,
        vibration DOUBLE,
        error_code VARCHAR(50),
        vehicle_id BIGINT NOT NULL,
        CONSTRAINT fk_sensor_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        INDEX idx_sensor_vehicle_timestamp (vehicle_id, timestamp DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Fault Predictions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fault_predictions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        risk_score DOUBLE NOT NULL,
        risk_level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
        predicted_fault_type VARCHAR(255),
        vehicle_id BIGINT NOT NULL,
        CONSTRAINT fk_prediction_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        INDEX idx_pred_vehicle_time (vehicle_id, created_at DESC),
        INDEX idx_pred_risk_level (risk_level)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. AI Explanations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_explanations (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        model_name VARCHAR(255),
        prompt_summary VARCHAR(1000),
        explanation_text MEDIUMTEXT,
        mode ENUM('QUICK', 'DEEP') NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        prediction_id BIGINT NOT NULL,
        CONSTRAINT fk_explanation_prediction FOREIGN KEY (prediction_id) REFERENCES fault_predictions(id) ON DELETE CASCADE,
        INDEX idx_explanation_pred (prediction_id, created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. AI Request Log
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_request_log (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        model_name VARCHAR(255),
        mode VARCHAR(50),
        latency_ms BIGINT,
        vehicle_name VARCHAR(255),
        predicted_fault VARCHAR(255),
        risk_score DOUBLE,
        risk_level VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ai_log_time (created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Knowledge Articles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS knowledge_articles (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        content MEDIUMTEXT,
        embedding_vector_id VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_kb_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Maintenance Records
    await pool.query(`
      CREATE TABLE IF NOT EXISTS maintenance_records (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        action VARCHAR(500) NOT NULL,
        notes VARCHAR(1000),
        repair_done BOOLEAN DEFAULT FALSE,
        vehicle_id BIGINT NOT NULL,
        CONSTRAINT fk_maintenance_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        INDEX idx_maintenance_vehicle (vehicle_id, date DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Check if initial users exist
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      const defaultPasswordHash = await bcrypt.hash('Password@1234', 10);
      await pool.query(`
        INSERT INTO users (id, name, email, password, role) VALUES
        (1, 'Admin Overseer', 'admin@autoguard.ai', ?, 'ADMIN'),
        (2, 'Chief Fleet Engineer', 'engineer@autoguard.ai', ?, 'ENGINEER'),
        (3, 'Alex Mercer (Owner)', 'driver@autoguard.ai', ?, 'OWNER')
      `, [defaultPasswordHash, defaultPasswordHash, defaultPasswordHash]);
      console.log('[DB] Seeded initial users (admin@autoguard.ai, engineer@autoguard.ai, driver@autoguard.ai with Password@1234)');
    }

    // Check if knowledge articles exist
    const [kbRows] = await pool.query('SELECT COUNT(*) as count FROM knowledge_articles');
    if (kbRows[0].count === 0) {
      await pool.query(`
        INSERT INTO knowledge_articles (title, category, content) VALUES
        ('Engine Overheating & Coolant Loop Failure', 'Cooling System', 'Standard operational temperature for modern combustion and hybrid engines ranges between 82°C and 95°C. Sustained telemetry exceeding 100°C indicates reduced coolant flow, thermostat valve lock, or radiator fan failure. Immediate action: Inspect coolant expansion tank level, pressure test radiator cap, and verify electrical continuity to the cooling fan relay (DTC P0217, P0128).'),
        ('Low Oil Pressure Diagnostic Procedures', 'Lubrication', 'Normal operational oil pressure ranges from 25 to 65 PSI at operating RPM. Pressure plunging below 20 PSI during high RPM demands immediate shutdown to prevent catastrophic crankshaft bearing seizure. Verify oil viscosity grade, inspect oil filter bypass valve, and check sensor harness resistance (DTC P0520, P0521).'),
        ('Harmonic Vibration & Engine Mount Deterioration', 'Drivetrain', 'Baseline vibration index must remain below 0.50 G-units. Vibration exceeding 1.0 indicates misfiring cylinder, unbalanced driveshaft, or collapsed hydraulic engine motor mounts. Review cylinder balance rates and check engine mount rubber bushings for fluid leaks or cracking.'),
        ('OBD-II Powertrain DTC Fault Code Matrix', 'Diagnostics', 'Standard OBD-II trouble codes indicate specific subsystem alerts: P0300/P0301 denotes multi-cylinder or cylinder 1 ignition misfire; P0171 indicates bank 1 system lean mixture; P0420 indicates catalyst system efficiency below threshold; P0442 signals small evaporative emission control system leak.')
      `);
      console.log('[DB] Seeded default knowledge base articles for RAG');
    }

  } catch (err) {
    console.error('[DB] Database initialization error:', err.message);
  }
}

export default pool;

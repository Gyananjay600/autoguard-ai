-- AutoGuard AI Relational Schema for MySQL 8.0+
-- Matches JPA Entities, Constraints, Foreign Keys & Relationships

CREATE DATABASE IF NOT EXISTS autoguard_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE autoguard_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('OWNER', 'ENGINEER', 'ADMIN') NOT NULL DEFAULT 'OWNER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Vehicles Table
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

-- 3. Sensor Readings Table
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

-- 4. Fault Predictions Table
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

-- 5. AI Explanations Table
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

-- 6. AI Request Audit Log Table
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

-- 7. Knowledge Articles Table (RAG Maintenance Knowledge)
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  content MEDIUMTEXT,
  embedding_vector_id VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_kb_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Maintenance Records Table
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

-- ==============================================================================
-- Initial Seed Data (Only inserted if tables are empty)
-- Passwords are hashed for 'Password@1234'
-- ==============================================================================

INSERT IGNORE INTO users (id, name, email, password, role) VALUES
(1, 'Admin Overseer', 'admin@autoguard.ai', '$2a$10$7Z2P.xNqI2Z4a7vK5b6k.uJtQ5A7n1M9p3Q2E5R8T1Y4U7I0O2P3S', 'ADMIN'),
(2, 'Chief Fleet Engineer', 'engineer@autoguard.ai', '$2a$10$7Z2P.xNqI2Z4a7vK5b6k.uJtQ5A7n1M9p3Q2E5R8T1Y4U7I0O2P3S', 'ENGINEER'),
(3, 'Alex Mercer (Owner)', 'driver@autoguard.ai', '$2a$10$7Z2P.xNqI2Z4a7vK5b6k.uJtQ5A7n1M9p3Q2E5R8T1Y4U7I0O2P3S', 'OWNER');

INSERT IGNORE INTO knowledge_articles (id, title, category, content) VALUES
(1, 'Engine Overheating & Coolant Loop Failure', 'Cooling System', 'Standard operational temperature for modern combustion and hybrid engines ranges between 82°C and 95°C. Sustained telemetry exceeding 100°C indicates reduced coolant flow, thermostat valve lock, or radiator fan failure. Immediate action: Inspect coolant expansion tank level, pressure test radiator cap, and verify electrical continuity to the cooling fan relay (DTC P0217, P0128).'),
(2, 'Low Oil Pressure Diagnostic Procedures', 'Lubrication', 'Normal operational oil pressure ranges from 25 to 65 PSI at operating RPM. Pressure plunging below 20 PSI during high RPM demands immediate shutdown to prevent catastrophic crankshaft bearing seizure. Verify oil viscosity grade, inspect oil filter bypass valve, and check sensor harness resistance (DTC P0520, P0521).'),
(3, 'Harmonic Vibration & Engine Mount Deterioration', 'Drivetrain', 'Baseline vibration index must remain below 0.50 G-units. Vibration exceeding 1.0 indicates misfiring cylinder, unbalanced driveshaft, or collapsed hydraulic engine motor mounts. Review cylinder balance rates and check engine mount rubber bushings for fluid leaks or cracking.'),
(4, 'OBD-II Powertrain DTC Fault Code Matrix', 'Diagnostics', 'Standard OBD-II trouble codes indicate specific subsystem alerts: P0300/P0301 denotes multi-cylinder or cylinder 1 ignition misfire; P0171 indicates bank 1 system lean mixture; P0420 indicates catalyst system efficiency below threshold; P0442 signals small evaporative emission control system leak.');

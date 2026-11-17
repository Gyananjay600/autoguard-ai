import { query } from '../config/db.js';
import VehicleService from './vehicleService.js';
import SensorService from './sensorService.js';
import RiskCalculatorService from './riskCalculatorService.js';
import AIDiagnosticService from './aiDiagnosticService.js';
import MaintenanceService from './maintenanceService.js';

export class PredictionService {
  /**
   * Run Quick AI Analysis (Mode: QUICK)
   * 1. Fetches latest 50 readings
   * 2. Evaluates risk score, risk level, predicted fault, and sensor summary
   * 3. Saves fault_predictions record
   * 4. Dispatches quick AI explanation to Groq with RAG context
   * 5. Returns structured prediction result
   */
  static async runQuickAnalysis(vehicleId) {
    const vehicle = await VehicleService.findById(vehicleId);
    const readings = await SensorService.getLatest50(vehicleId);

    const riskScore = RiskCalculatorService.calculateRiskScore(readings);
    const riskLevel = RiskCalculatorService.determineRiskLevel(riskScore);
    const faultType = RiskCalculatorService.predictFaultType(readings);
    const sensorSummary = RiskCalculatorService.buildSensorSummary(readings);

    // Save prediction record
    const insertResult = await query(
      `INSERT INTO fault_predictions (vehicle_id, risk_score, risk_level, predicted_fault_type, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [vehicleId, riskScore, riskLevel, faultType]
    );

    const predictionId = insertResult.insertId;
    const predictionRecord = {
      id: predictionId,
      vehicle_id: vehicleId,
      risk_score: riskScore,
      risk_level: riskLevel,
      predicted_fault_type: faultType
    };

    // Generate quick AI explanation
    const aiExplanation = await AIDiagnosticService.generateQuickExplanation(
      predictionRecord,
      sensorSummary,
      vehicle
    );

    const predictionRows = await query('SELECT created_at FROM fault_predictions WHERE id = ?', [predictionId]);

    return {
      predictionId,
      riskScore,
      riskLevel,
      predictedFaultType: faultType,
      explanation: aiExplanation.explanationText,
      modelName: aiExplanation.modelName,
      mode: 'QUICK',
      latencyMs: aiExplanation.latencyMs,
      createdAt: predictionRows[0]?.created_at || new Date()
    };
  }

  /**
   * Run Deep AI Diagnostic (Mode: DEEP)
   * 1. Fetches latest 50 readings and maintenance history
   * 2. Evaluates risk and sensor summary
   * 3. Saves fault_predictions record
   * 4. Dispatches deep multi-step diagnostic report to Groq grounded in vector RAG
   * 5. Returns structured prediction result
   */
  static async runDeepDiagnostic(vehicleId) {
    const vehicle = await VehicleService.findById(vehicleId);
    const readings = await SensorService.getLatest50(vehicleId);
    const maintenance = await MaintenanceService.getByVehicle(vehicleId);

    const riskScore = RiskCalculatorService.calculateRiskScore(readings);
    const riskLevel = RiskCalculatorService.determineRiskLevel(riskScore);
    const faultType = RiskCalculatorService.predictFaultType(readings);
    const sensorSummary = RiskCalculatorService.buildSensorSummary(readings);

    // Save prediction record
    const insertResult = await query(
      `INSERT INTO fault_predictions (vehicle_id, risk_score, risk_level, predicted_fault_type, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [vehicleId, riskScore, riskLevel, faultType]
    );

    const predictionId = insertResult.insertId;
    const predictionRecord = {
      id: predictionId,
      vehicle_id: vehicleId,
      risk_score: riskScore,
      risk_level: riskLevel,
      predicted_fault_type: faultType
    };

    // Generate deep AI diagnostic
    const aiExplanation = await AIDiagnosticService.generateDeepDiagnostic(
      predictionRecord,
      sensorSummary,
      vehicle,
      maintenance
    );

    const predictionRows = await query('SELECT created_at FROM fault_predictions WHERE id = ?', [predictionId]);

    return {
      predictionId,
      riskScore,
      riskLevel,
      predictedFaultType: faultType,
      explanation: aiExplanation.explanationText,
      modelName: aiExplanation.modelName,
      mode: 'DEEP',
      latencyMs: aiExplanation.latencyMs,
      createdAt: predictionRows[0]?.created_at || new Date()
    };
  }
}

export default PredictionService;

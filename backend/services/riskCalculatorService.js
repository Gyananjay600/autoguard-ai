/**
 * AutoGuard AI Risk Calculator Service
 * Translates raw sensor readings into quantitative risk scores, categorical risk levels,
 * fault type predictions, and formatted summaries.
 */

export class RiskCalculatorService {
  /**
   * Calculates numerical risk score normalized to 0.0 - 100.0
   * Preserves 100% of the Java scoring matrix
   */
  static calculateRiskScore(readings) {
    if (!readings || readings.length === 0) return 0.0;

    let score = 0.0;
    const count = readings.length;

    for (const r of readings) {
      // Engine temp scoring — normal is 80-95°C
      if (r.engine_temp != null || r.engineTemp != null) {
        const temp = Number(r.engine_temp ?? r.engineTemp);
        if (temp > 110) score += 3.0;
        else if (temp > 100) score += 2.0;
        else if (temp > 95) score += 1.0;
      }

      // Oil pressure scoring — normal is 25-65 PSI
      if (r.oil_pressure != null || r.oilPressure != null) {
        const oil = Number(r.oil_pressure ?? r.oilPressure);
        if (oil < 10) score += 3.0;
        else if (oil < 20) score += 2.0;
        else if (oil > 80) score += 1.5;
      }

      // RPM scoring — abnormal if over 6000 repeatedly
      if (r.rpm != null) {
        const rpm = Number(r.rpm);
        if (rpm > 6000) score += 2.0;
        else if (rpm > 5000) score += 1.0;
      }

      // Vibration scoring — normal under 0.5
      if (r.vibration != null) {
        const vib = Number(r.vibration);
        if (vib > 2.0) score += 3.0;
        else if (vib > 1.0) score += 1.5;
        else if (vib > 0.5) score += 0.5;
      }

      // Error code presence adds risk
      const code = r.error_code ?? r.errorCode;
      if (code && String(code).trim().length > 0) {
        score += 2.0;
      }
    }

    // Normalize to 0-100 scale: Math.min((score / count) * 10, 100.0)
    const normalized = Math.min((score / count) * 10, 100.0);
    return Math.round(normalized * 100.0) / 100.0;
  }

  /**
   * Evaluates Risk Level enum string: LOW, MEDIUM, HIGH
   */
  static determineRiskLevel(riskScore) {
    if (riskScore >= 60) return 'HIGH';
    if (riskScore >= 30) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Evaluates primary predicted fault type based on dominant anomaly flags
   */
  static predictFaultType(readings) {
    if (!readings || readings.length === 0) return 'Unknown';

    const count = readings.length;
    let highTemp = 0;
    let lowOil = 0;
    let highVib = 0;
    let errorCodes = 0;

    for (const r of readings) {
      const temp = r.engine_temp ?? r.engineTemp;
      const oil = r.oil_pressure ?? r.oilPressure;
      const vib = r.vibration;
      const code = r.error_code ?? r.errorCode;

      if (temp != null && Number(temp) > 100) highTemp++;
      if (oil != null && Number(oil) < 20) lowOil++;
      if (vib != null && Number(vib) > 1.0) highVib++;
      if (code && String(code).trim().length > 0) errorCodes++;
    }

    if (highTemp > count / 2) return 'Cooling System Fault';
    if (lowOil > count / 2) return 'Oil Pressure Issue';
    if (highVib > count / 2) return 'Engine Vibration / Mount Issue';
    if (errorCodes > 0) return 'ECU Error Code Detected';
    return 'General Wear — Routine Check Recommended';
  }

  /**
   * Generates formatted numerical summary for generative AI grounding
   */
  static buildSensorSummary(readings) {
    if (!readings || readings.length === 0) {
      return 'No sensor data available.';
    }

    let sumTemp = 0, countTemp = 0;
    let sumOil = 0, countOil = 0;
    let sumRpm = 0, countRpm = 0;
    let sumVib = 0, countVib = 0;
    const errorCodesSet = new Set();

    for (const r of readings) {
      const temp = r.engine_temp ?? r.engineTemp;
      const oil = r.oil_pressure ?? r.oilPressure;
      const rpm = r.rpm;
      const vib = r.vibration;
      const code = r.error_code ?? r.errorCode;

      if (temp != null) { sumTemp += Number(temp); countTemp++; }
      if (oil != null) { sumOil += Number(oil); countOil++; }
      if (rpm != null) { sumRpm += Number(rpm); countRpm++; }
      if (vib != null) { sumVib += Number(vib); countVib++; }
      if (code && String(code).trim().length > 0) {
        errorCodesSet.add(String(code).trim());
      }
    }

    const avgTemp = countTemp > 0 ? (sumTemp / countTemp).toFixed(1) : '0.0';
    const avgOil = countOil > 0 ? (sumOil / countOil).toFixed(1) : '0.0';
    const avgRpm = countRpm > 0 ? Math.round(sumRpm / countRpm) : 0;
    const avgVib = countVib > 0 ? (sumVib / countVib).toFixed(2) : '0.00';
    const errorCodes = errorCodesSet.size > 0 ? Array.from(errorCodesSet).join(', ') : 'None';

    return `Sensor Summary (${readings.length} readings):
- Average Engine Temp: ${avgTemp}°C
- Average Oil Pressure: ${avgOil} PSI
- Average RPM: ${avgRpm}
- Average Vibration: ${avgVib}
- Error Codes Present: ${errorCodes}`;
  }
}

export default RiskCalculatorService;

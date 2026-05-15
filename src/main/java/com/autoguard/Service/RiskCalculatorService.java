package com.autoguard.Service;

import com.autoguard.enums.RiskLevel;
import com.autoguard.Model.SensorReading;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RiskCalculatorService {

    public double calculateRiskScore(List<SensorReading> readings) {
        if (readings == null || readings.isEmpty()) return 0.0;

        double score = 0.0;
        int count = readings.size();

        for (SensorReading r : readings) {
            // Engine temp scoring — normal is 80-95°C
            if (r.getEngineTemp() != null) {
                if (r.getEngineTemp() > 110) score += 3.0;
                else if (r.getEngineTemp() > 100) score += 2.0;
                else if (r.getEngineTemp() > 95)  score += 1.0;
            }

            // Oil pressure scoring — normal is 25-65 PSI
            if (r.getOilPressure() != null) {
                if (r.getOilPressure() < 10)      score += 3.0;
                else if (r.getOilPressure() < 20)  score += 2.0;
                else if (r.getOilPressure() > 80)  score += 1.5;
            }

            // RPM scoring — abnormal if over 6000 repeatedly
            if (r.getRpm() != null) {
                if (r.getRpm() > 6000)       score += 2.0;
                else if (r.getRpm() > 5000)  score += 1.0;
            }

            // Vibration scoring — normal under 0.5
            if (r.getVibration() != null) {
                if (r.getVibration() > 2.0)      score += 3.0;
                else if (r.getVibration() > 1.0)  score += 1.5;
                else if (r.getVibration() > 0.5)  score += 0.5;
            }

            // Error code present adds risk
            if (r.getErrorCode() != null && !r.getErrorCode().isBlank()) {
                score += 2.0;
            }
        }

        // Normalize to 0-100 scale
        double normalized = Math.min((score / count) * 10, 100.0);
        return Math.round(normalized * 100.0) / 100.0;
    }

    public RiskLevel determineRiskLevel(double riskScore) {
        if (riskScore >= 60) return RiskLevel.HIGH;
        if (riskScore >= 30) return RiskLevel.MEDIUM;
        return RiskLevel.LOW;
    }

    public String predictFaultType(List<SensorReading> readings) {
        if (readings == null || readings.isEmpty()) return "Unknown";

        long highTemp   = readings.stream()
                .filter(r -> r.getEngineTemp() != null && r.getEngineTemp() > 100)
                .count();
        long lowOil     = readings.stream()
                .filter(r -> r.getOilPressure() != null && r.getOilPressure() < 20)
                .count();
        long highVib    = readings.stream()
                .filter(r -> r.getVibration() != null && r.getVibration() > 1.0)
                .count();
        long errorCodes = readings.stream()
                .filter(r -> r.getErrorCode() != null && !r.getErrorCode().isBlank())
                .count();

        if (highTemp > readings.size() / 2) return "Cooling System Fault";
        if (lowOil   > readings.size() / 2) return "Oil Pressure Issue";
        if (highVib  > readings.size() / 2) return "Engine Vibration / Mount Issue";
        if (errorCodes > 0)                 return "ECU Error Code Detected";
        return "General Wear — Routine Check Recommended";
    }

    public String buildSensorSummary(List<SensorReading> readings) {
        if (readings == null || readings.isEmpty())
            return "No sensor data available.";

        double avgTemp = readings.stream()
                .filter(r -> r.getEngineTemp() != null)
                .mapToDouble(SensorReading::getEngineTemp)
                .average().orElse(0);

        double avgOil = readings.stream()
                .filter(r -> r.getOilPressure() != null)
                .mapToDouble(SensorReading::getOilPressure)
                .average().orElse(0);

        double avgRpm = readings.stream()
                .filter(r -> r.getRpm() != null)
                .mapToDouble(SensorReading::getRpm)
                .average().orElse(0);

        double avgVib = readings.stream()
                .filter(r -> r.getVibration() != null)
                .mapToDouble(SensorReading::getVibration)
                .average().orElse(0);

        String errorCodes = readings.stream()
                .filter(r -> r.getErrorCode() != null && !r.getErrorCode().isBlank())
                .map(SensorReading::getErrorCode)
                .distinct()
                .reduce((a, b) -> a + ", " + b)
                .orElse("None");

        return String.format("""
                Sensor Summary (%d readings):
                - Average Engine Temp: %.1f°C
                - Average Oil Pressure: %.1f PSI
                - Average RPM: %.0f
                - Average Vibration: %.2f
                - Error Codes Present: %s
                """,
                readings.size(), avgTemp, avgOil,
                avgRpm, avgVib, errorCodes);
    }
}
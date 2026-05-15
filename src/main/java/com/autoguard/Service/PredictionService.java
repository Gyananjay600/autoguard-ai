package com.autoguard.Service;

import com.autoguard.dto.PredictionResultDTO;
import com.autoguard.enums.RiskLevel;
import com.autoguard.Model.*;
import com.autoguard.Repository.FaultPredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionService {

    private final FaultPredictionRepository faultPredictionRepository;
    private final SensorService sensorService;
    private final RiskCalculatorService riskCalculatorService;
    private final AIExplainerService aiExplainerService;
    private final AIDiagnosticService aiDiagnosticService;
    private final MaintenanceService maintenanceService;
    private final VehicleService vehicleService;

    public PredictionResultDTO runQuickAnalysis(Long vehicleId) {
        Vehicle vehicle = vehicleService.findById(vehicleId);
        List<SensorReading> readings = sensorService.getLatest50(vehicleId);

        // Calculate risk
        double riskScore = riskCalculatorService.calculateRiskScore(readings);
        RiskLevel riskLevel = riskCalculatorService.determineRiskLevel(riskScore);
        String faultType = riskCalculatorService.predictFaultType(readings);
        String sensorSummary = riskCalculatorService.buildSensorSummary(readings);

        // Save prediction
        FaultPrediction prediction = FaultPrediction.builder()
                .vehicle(vehicle)
                .riskScore(riskScore)
                .riskLevel(riskLevel)
                .predictedFaultType(faultType)
                .build();
        prediction = faultPredictionRepository.save(prediction);

        // Generate quick AI explanation
        AIExplanation explanation = aiExplainerService
                .generateQuickExplanation(prediction, sensorSummary);

        log.info("Quick analysis completed for vehicle {} — Risk: {} ({})",
                vehicleId, riskScore, riskLevel);

        return PredictionResultDTO.builder()
                .predictionId(prediction.getId())
                .riskScore(riskScore)
                .riskLevel(riskLevel)
                .predictedFaultType(faultType)
                .explanation(explanation.getExplanationText())
                .createdAt(prediction.getCreatedAt())
                .build();
    }

    public PredictionResultDTO runDeepDiagnostic(Long vehicleId) {
        Vehicle vehicle = vehicleService.findById(vehicleId);
        List<SensorReading> readings = sensorService.getLatest50(vehicleId);
        List<MaintenanceRecord> maintenance = maintenanceService
                .getByVehicle(vehicleId);

        double riskScore = riskCalculatorService.calculateRiskScore(readings);
        RiskLevel riskLevel = riskCalculatorService.determineRiskLevel(riskScore);
        String faultType = riskCalculatorService.predictFaultType(readings);
        String sensorSummary = riskCalculatorService.buildSensorSummary(readings);

        FaultPrediction prediction = FaultPrediction.builder()
                .vehicle(vehicle)
                .riskScore(riskScore)
                .riskLevel(riskLevel)
                .predictedFaultType(faultType)
                .build();
        prediction = faultPredictionRepository.save(prediction);

        // Generate deep AI diagnostic
        AIExplanation explanation = aiDiagnosticService
                .generateDeepDiagnostic(
                        prediction, sensorSummary, vehicle, maintenance);

        log.info("Deep diagnostic completed for vehicle {} — Risk: {} ({})",
                vehicleId, riskScore, riskLevel);

        return PredictionResultDTO.builder()
                .predictionId(prediction.getId())
                .riskScore(riskScore)
                .riskLevel(riskLevel)
                .predictedFaultType(faultType)
                .explanation(explanation.getExplanationText())
                .createdAt(prediction.getCreatedAt())
                .build();
    }
}
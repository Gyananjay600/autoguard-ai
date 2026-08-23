package com.autoguard.Service;

import com.autoguard.enums.RiskLevel;
import com.autoguard.Model.FaultPrediction;
import com.autoguard.Repository.FaultPredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final FaultPredictionRepository faultPredictionRepository;

    public List<FaultPrediction> getAlertsByVehicle(Long vehicleId) {
        // Uses JOIN FETCH to eagerly load explanations
        // preventing LazyInitializationException in Thymeleaf
        return faultPredictionRepository
                .findByVehicleIdWithExplanations(vehicleId);
    }

    public List<FaultPrediction> getHighRiskAlerts() {
        return faultPredictionRepository.findByRiskLevel(RiskLevel.HIGH);
    }

    public long countHighRisk() {
        return faultPredictionRepository.countByRiskLevel(RiskLevel.HIGH);
    }

    public long countMediumRisk() {
        return faultPredictionRepository.countByRiskLevel(RiskLevel.MEDIUM);
    }

    public long countLowRisk() {
        return faultPredictionRepository.countByRiskLevel(RiskLevel.LOW);
    }

    public long countByRiskLevelForUser(RiskLevel riskLevel, Long userId) {
        return faultPredictionRepository
                .countByRiskLevelAndVehicle_User_Id(riskLevel, userId);
    }
}

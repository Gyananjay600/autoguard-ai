package com.autoguard.Service;

import com.autoguard.dto.DashboardSummaryDTO;
import com.autoguard.Model.User;
import com.autoguard.enums.RiskLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VehicleService vehicleService;
    private final AlertService alertService;

    public DashboardSummaryDTO getSummary(User user, boolean canViewAllVehicles) {
        long highRisk = canViewAllVehicles
                ? alertService.countHighRisk()
                : alertService.countByRiskLevelForUser(RiskLevel.HIGH, user.getId());
        long mediumRisk = canViewAllVehicles
                ? alertService.countMediumRisk()
                : alertService.countByRiskLevelForUser(RiskLevel.MEDIUM, user.getId());
        long lowRisk = canViewAllVehicles
                ? alertService.countLowRisk()
                : alertService.countByRiskLevelForUser(RiskLevel.LOW, user.getId());

        return DashboardSummaryDTO.builder()
                .totalVehicles(canViewAllVehicles
                        ? vehicleService.countAll()
                        : vehicleService.countByUser(user))
                .highRiskCount(highRisk)
                .mediumRiskCount(mediumRisk)
                .lowRiskCount(lowRisk)
                .totalAlerts(highRisk + mediumRisk + lowRisk)
                .build();
    }
}

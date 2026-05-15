package com.autoguard.Service;

import com.autoguard.dto.DashboardSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VehicleService vehicleService;
    private final AlertService alertService;

    public DashboardSummaryDTO getSummary() {
        return DashboardSummaryDTO.builder()
                .totalVehicles(vehicleService.countAll())
                .highRiskCount(alertService.countHighRisk())
                .mediumRiskCount(alertService.countMediumRisk())
                .lowRiskCount(alertService.countLowRisk())
                .totalAlerts(alertService.countHighRisk()
                        + alertService.countMediumRisk()
                        + alertService.countLowRisk())
                .build();
    }
}
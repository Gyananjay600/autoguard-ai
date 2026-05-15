package com.autoguard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {

    private long totalVehicles;
    private long highRiskCount;
    private long mediumRiskCount;
    private long lowRiskCount;
    private long totalAlerts;
}
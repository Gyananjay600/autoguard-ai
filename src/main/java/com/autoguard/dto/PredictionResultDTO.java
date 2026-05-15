package com.autoguard.dto;

import com.autoguard.enums.RiskLevel;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionResultDTO {

    private Long predictionId;
    private Double riskScore;
    private RiskLevel riskLevel;
    private String predictedFaultType;
    private String explanation;
    private LocalDateTime createdAt;
}
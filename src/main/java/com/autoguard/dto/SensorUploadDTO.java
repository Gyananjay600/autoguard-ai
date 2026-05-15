package com.autoguard.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorUploadDTO {

    @NotNull
    private Long vehicleId;

    private LocalDateTime timestamp;

    private Double rpm;

    private Double engineTemp;

    private Double oilPressure;

    private Double vibration;

    private String errorCode;
}
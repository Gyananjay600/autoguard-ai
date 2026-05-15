package com.autoguard.dto;

import com.autoguard.enums.DiagnosticMode;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIResponseDTO {

    private String modelName;
    private String explanation;
    private DiagnosticMode mode;
    private long latencyMs;
}
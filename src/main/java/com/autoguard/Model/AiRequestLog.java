package com.autoguard.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_request_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiRequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String modelName;
    private String mode;           // QUICK / DEEP
    private Long latencyMs;
    private String vehicleName;
    private String predictedFault;
    private Double riskScore;
    private String riskLevel;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
package com.autoguard.Model;

import com.autoguard.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "fault_predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaultPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime createdAt;

    private Double riskScore;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    private String predictedFaultType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @OneToMany(mappedBy = "prediction", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AIExplanation> explanations;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
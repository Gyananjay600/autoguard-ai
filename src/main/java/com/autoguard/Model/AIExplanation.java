package com.autoguard.Model;

import com.autoguard.enums.DiagnosticMode;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_explanations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIExplanation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String modelName;

    @Column(length = 1000)
    private String promptSummary;

    @Column(length = 5000)
    private String explanationText;

    @Enumerated(EnumType.STRING)
    private DiagnosticMode mode;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prediction_id")
    private FaultPrediction prediction;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
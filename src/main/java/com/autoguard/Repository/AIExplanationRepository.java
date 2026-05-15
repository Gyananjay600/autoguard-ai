package com.autoguard.Repository;

import com.autoguard.Model.AIExplanation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIExplanationRepository extends JpaRepository<AIExplanation, Long> {
    List<AIExplanation> findByPredictionIdOrderByCreatedAtDesc(Long predictionId);
}
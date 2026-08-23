package com.autoguard.Repository;

import com.autoguard.enums.RiskLevel;
import com.autoguard.Model.FaultPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaultPredictionRepository
        extends JpaRepository<FaultPrediction, Long> {

    @Query("SELECT fp FROM FaultPrediction fp " +
            "LEFT JOIN FETCH fp.explanations " +
            "WHERE fp.vehicle.id = :vehicleId " +
            "ORDER BY fp.createdAt DESC")
    List<FaultPrediction> findByVehicleIdWithExplanations(
            @Param("vehicleId") Long vehicleId);

    List<FaultPrediction> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);

    List<FaultPrediction> findByRiskLevel(RiskLevel riskLevel);

    long countByRiskLevel(RiskLevel riskLevel);

    long countByRiskLevelAndVehicle_User_Id(RiskLevel riskLevel, Long userId);
}

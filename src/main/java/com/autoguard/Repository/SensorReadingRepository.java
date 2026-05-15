package com.autoguard.Repository;

import com.autoguard.Model.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
    List<SensorReading> findByVehicleIdOrderByTimestampDesc(Long vehicleId);
    List<SensorReading> findTop50ByVehicleIdOrderByTimestampDesc(Long vehicleId);
}
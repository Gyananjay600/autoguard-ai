package com.autoguard.Service;

import com.autoguard.dto.SensorUploadDTO;
import com.autoguard.Model.SensorReading;
import com.autoguard.Model.Vehicle;
import com.autoguard.Repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SensorService {

    private final SensorReadingRepository sensorReadingRepository;
    private final VehicleService vehicleService;

    public SensorReading save(SensorUploadDTO dto) {
        Vehicle vehicle = vehicleService.findById(dto.getVehicleId());
        SensorReading reading = SensorReading.builder()
                .vehicle(vehicle)
                .timestamp(dto.getTimestamp() != null
                        ? dto.getTimestamp() : LocalDateTime.now())
                .rpm(dto.getRpm())
                .engineTemp(dto.getEngineTemp())
                .oilPressure(dto.getOilPressure())
                .vibration(dto.getVibration())
                .errorCode(dto.getErrorCode())
                .build();
        return sensorReadingRepository.save(reading);
    }

    public List<SensorReading> getReadingsByVehicle(Long vehicleId) {
        return sensorReadingRepository
                .findByVehicleIdOrderByTimestampDesc(vehicleId);
    }

    public List<SensorReading> getLatest50(Long vehicleId) {
        return sensorReadingRepository
                .findTop50ByVehicleIdOrderByTimestampDesc(vehicleId);
    }
}
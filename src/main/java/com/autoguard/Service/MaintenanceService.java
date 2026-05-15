package com.autoguard.Service;

import com.autoguard.Model.MaintenanceRecord;
import com.autoguard.Model.Vehicle;
import com.autoguard.Repository.MaintenanceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final VehicleService vehicleService;

    public MaintenanceRecord save(Long vehicleId, String action, String notes) {
        Vehicle vehicle = vehicleService.findById(vehicleId);
        MaintenanceRecord record = MaintenanceRecord.builder()
                .vehicle(vehicle)
                .date(LocalDate.now())
                .action(action)
                .notes(notes)
                .repairDone(false)
                .build();
        return maintenanceRecordRepository.save(record);
    }

    public List<MaintenanceRecord> getByVehicle(Long vehicleId) {
        return maintenanceRecordRepository
                .findByVehicleIdOrderByDateDesc(vehicleId);
    }

    public void markRepairDone(Long recordId) {
        MaintenanceRecord record = maintenanceRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Record not found: " + recordId));
        record.setRepairDone(true);
        maintenanceRecordRepository.save(record);
    }
}
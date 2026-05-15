package com.autoguard.Service;

import com.autoguard.Model.User;
import com.autoguard.Model.Vehicle;
import com.autoguard.Repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public Vehicle save(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public List<Vehicle> getVehiclesByUser(User user) {
        return vehicleRepository.findByUserId(user.getId());
    }

    public Vehicle findById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));
    }

    public Vehicle update(Long id, Vehicle updated) {
        Vehicle existing = findById(id);
        existing.setName(updated.getName());
        existing.setMake(updated.getMake());
        existing.setModel(updated.getModel());
        existing.setYear(updated.getYear());
        existing.setMileage(updated.getMileage());
        existing.setEngineType(updated.getEngineType());
        existing.setVin(updated.getVin());
        return vehicleRepository.save(existing);
    }

    public void delete(Long id) {
        vehicleRepository.deleteById(id);
    }

    public long countAll() {
        return vehicleRepository.count();
    }
}
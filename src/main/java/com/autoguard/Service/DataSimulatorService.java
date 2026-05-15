package com.autoguard.Service;

import com.autoguard.Model.SensorReading;
import com.autoguard.Model.Vehicle;
import com.autoguard.Repository.SensorReadingRepository;
import com.autoguard.Repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataSimulatorService {

    private final VehicleRepository vehicleRepository;
    private final SensorReadingRepository sensorReadingRepository;

    private final Random random = new Random();

    // Runs every 30 seconds automatically
    @Scheduled(fixedDelay = 30000)
    public void simulateAllVehicles() {
        List<Vehicle> vehicles = vehicleRepository.findAll();

        if (vehicles.isEmpty()) {
            log.debug("Simulator: no vehicles found, skipping");
            return;
        }

        for (Vehicle vehicle : vehicles) {
            SensorReading reading = generateReading(vehicle);
            sensorReadingRepository.save(reading);
            log.info("Simulator: generated reading for vehicle '{}' — "
                            + "Temp: {}°C, RPM: {}, Oil: {}, Vib: {}",
                    vehicle.getName(),
                    reading.getEngineTemp(),
                    reading.getRpm(),
                    reading.getOilPressure(),
                    reading.getVibration());
        }
    }

    // Manually trigger simulation for one vehicle
    public SensorReading simulateForVehicle(Vehicle vehicle) {
        SensorReading reading = generateReading(vehicle);
        sensorReadingRepository.save(reading);
        log.info("Manual simulation for vehicle '{}'", vehicle.getName());
        return reading;
    }

    // Generate 20 historical readings for a new vehicle
    public void generateHistoricalData(Vehicle vehicle) {
        for (int i = 20; i >= 1; i--) {
            SensorReading reading = generateReading(vehicle);
            reading.setTimestamp(LocalDateTime.now().minusMinutes(i * 5L));
            sensorReadingRepository.save(reading);
        }
        log.info("Generated 20 historical readings for vehicle '{}'",
                vehicle.getName());
    }

    private SensorReading generateReading(Vehicle vehicle) {
        // Simulate realistic sensor values with occasional anomalies
        double engineTemp  = generateEngineTemp();
        double oilPressure = generateOilPressure();
        double rpm         = generateRpm();
        double vibration   = generateVibration();
        String errorCode   = generateErrorCode(engineTemp, oilPressure);

        return SensorReading.builder()
                .vehicle(vehicle)
                .timestamp(LocalDateTime.now())
                .engineTemp(engineTemp)
                .oilPressure(oilPressure)
                .rpm(rpm)
                .vibration(vibration)
                .errorCode(errorCode)
                .build();
    }

    private double generateEngineTemp() {
        // Normal: 80-95°C, occasional spike to 100-115°C
        int chance = random.nextInt(100);
        if (chance < 5)  return round(105 + random.nextDouble() * 10); // high
        if (chance < 15) return round(96  + random.nextDouble() * 8);  // warm
        return round(80 + random.nextDouble() * 15);                    // normal
    }

    private double generateOilPressure() {
        // Normal: 35-65 PSI, occasional low drop
        int chance = random.nextInt(100);
        if (chance < 5)  return round(8  + random.nextDouble() * 12);  // very low
        if (chance < 12) return round(20 + random.nextDouble() * 10);  // low
        return round(35 + random.nextDouble() * 30);                    // normal
    }

    private double generateRpm() {
        // Normal: 800-4000 RPM
        int chance = random.nextInt(100);
        if (chance < 5) return round(5000 + random.nextDouble() * 2000); // high
        return round(800 + random.nextDouble() * 3200);                   // normal
    }

    private double generateVibration() {
        // Normal: 0.1-0.5, occasional high vibration
        int chance = random.nextInt(100);
        if (chance < 5)  return round(2.0 + random.nextDouble() * 1.5); // high
        if (chance < 15) return round(0.8 + random.nextDouble() * 0.8); // medium
        return round(0.1 + random.nextDouble() * 0.4);                   // normal
    }

    private String generateErrorCode(double temp, double oil) {
        // Generate error codes based on actual sensor values
        if (temp > 105) return "P0217"; // engine over temperature
        if (temp > 100) return "P0128"; // coolant temp below thermostat
        if (oil < 15)   return "P0520"; // oil pressure sensor
        if (oil < 25)   return "P0521"; // oil pressure range
        // 5% random chance of misc error
        if (random.nextInt(100) < 5) {
            String[] codes = {"P0300", "P0301", "P0171", "P0420", "P0442"};
            return codes[random.nextInt(codes.length)];
        }
        return null; // no error
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
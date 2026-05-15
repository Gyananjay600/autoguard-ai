package com.autoguard.Controller;

import com.autoguard.Model.FaultPrediction;
import com.autoguard.Model.User;
import com.autoguard.Model.Vehicle;
import com.autoguard.security.SecurityUtils;
import com.autoguard.Service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;
    private final SensorService sensorService;
    private final MaintenanceService maintenanceService;
    private final AlertService alertService;
    private final SecurityUtils securityUtils;
    private final DataSimulatorService dataSimulatorService;  // added

    @GetMapping
    public String listVehicles(Model model) {
        User currentUser = securityUtils.getCurrentUser();
        if (securityUtils.isAdmin() || securityUtils.isEngineer()) {
            model.addAttribute("vehicles",
                    vehicleService.getAllVehicles());
        } else {
            model.addAttribute("vehicles",
                    vehicleService.getVehiclesByUser(currentUser));
        }
        return "vehicle/list";
    }

    @GetMapping("/new")
    public String newVehicleForm(Model model) {
        model.addAttribute("vehicle", new Vehicle());
        return "vehicle/form";
    }

    @PostMapping("/save")
    public String saveVehicle(@ModelAttribute Vehicle vehicle) {
        User currentUser = securityUtils.getCurrentUser();
        vehicle.setUser(currentUser);
        Vehicle saved = vehicleService.save(vehicle);

        // Auto-generate historical data for new vehicle
        dataSimulatorService.generateHistoricalData(saved);

        return "redirect:/vehicles";
    }

    @GetMapping("/{id}/edit")
    public String editVehicleForm(@PathVariable Long id, Model model) {
        model.addAttribute("vehicle", vehicleService.findById(id));
        return "vehicle/form";
    }

    @PostMapping("/{id}/update")
    public String updateVehicle(@PathVariable Long id,
                                @ModelAttribute Vehicle vehicle) {
        vehicleService.update(id, vehicle);
        return "redirect:/vehicles";
    }

    @PostMapping("/{id}/delete")
    public String deleteVehicle(@PathVariable Long id) {
        vehicleService.delete(id);
        return "redirect:/vehicles";
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public String vehicleDetail(@PathVariable Long id, Model model) {
        Vehicle vehicle = vehicleService.findById(id);

        List<FaultPrediction> alerts =
                alertService.getAlertsByVehicle(id);

        // Force initialize explanations within the transaction
        // to prevent LazyInitializationException in Thymeleaf
        alerts.forEach(alert -> alert.getExplanations().size());

        model.addAttribute("vehicle", vehicle);
        model.addAttribute("sensorReadings",
                sensorService.getLatest50(id));
        model.addAttribute("maintenanceRecords",
                maintenanceService.getByVehicle(id));
        model.addAttribute("alerts", alerts);
        return "vehicle/detail";
    }

    // ── Simulator endpoints ──────────────────────────────────

    @PostMapping("/{id}/simulate")
    public String simulateReading(@PathVariable Long id) {
        Vehicle vehicle = vehicleService.findById(id);
        dataSimulatorService.simulateForVehicle(vehicle);
        return "redirect:/vehicles/" + id;
    }

    @PostMapping("/{id}/simulate/history")
    public String generateHistory(@PathVariable Long id) {
        Vehicle vehicle = vehicleService.findById(id);
        dataSimulatorService.generateHistoricalData(vehicle);
        return "redirect:/vehicles/" + id;
    }
}
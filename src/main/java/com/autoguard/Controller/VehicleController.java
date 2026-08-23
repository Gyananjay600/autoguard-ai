package com.autoguard.Controller;

import com.autoguard.Model.FaultPrediction;
import com.autoguard.Model.User;
import com.autoguard.Model.Vehicle;
import com.autoguard.Service.*;
import com.autoguard.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

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
    private final DataSimulatorService dataSimulatorService;

    // ===============================
    // Vehicle List
    // ===============================

    @GetMapping
    public String listVehicles(Model model) {

        User currentUser = securityUtils.getCurrentUser();

        if (securityUtils.isAdmin() || securityUtils.isEngineer()) {
            model.addAttribute(
                    "vehicles",
                    vehicleService.getAllVehicles()
            );
        } else {
            model.addAttribute(
                    "vehicles",
                    vehicleService.getVehiclesByUser(currentUser)
            );
        }

        return "vehicle/list";
    }

    // ===============================
    // Add Vehicle
    // ===============================

    @GetMapping("/new")
    public String newVehicleForm(Model model) {
        model.addAttribute("vehicle", new Vehicle());
        return "vehicle/form";
    }

    @PostMapping("/save")
    public String saveVehicle(@ModelAttribute Vehicle vehicle,
                              RedirectAttributes ra) {

        User currentUser = securityUtils.getCurrentUser();

        vehicle.setUser(currentUser);

        Vehicle savedVehicle = vehicleService.save(vehicle);

        // Generate initial historical data
        dataSimulatorService.generateHistoricalData(savedVehicle);

        ra.addFlashAttribute(
                "successMessage",
                "Vehicle '" + vehicle.getName() + "' added successfully."
        );

        return "redirect:/vehicles";
    }

    // ===============================
    // Edit Vehicle
    // ===============================

    @GetMapping("/{id}/edit")
    public String editVehicleForm(@PathVariable Long id,
                                  Model model) {
        model.addAttribute("vehicle", vehicleService.getAuthorizedVehicle(
                id, securityUtils.getCurrentUser()));

        return "vehicle/form";
    }

    @PostMapping("/{id}/update")
    public String updateVehicle(@PathVariable Long id,
                                @ModelAttribute Vehicle vehicle,
                                RedirectAttributes ra) {
        vehicleService.verifyOwnership(id, securityUtils.getCurrentUser());
        vehicleService.update(id, vehicle);

        ra.addFlashAttribute(
                "successMessage",
                "Vehicle updated successfully."
        );

        return "redirect:/vehicles";
    }

    // ===============================
    // Delete Vehicle
    // ===============================

    @PostMapping("/{id}/delete")
    public String deleteVehicle(@PathVariable Long id,
                                RedirectAttributes ra) {
        vehicleService.verifyOwnership(id, securityUtils.getCurrentUser());
        vehicleService.delete(id);

        ra.addFlashAttribute(
                "successMessage",
                "Vehicle deleted successfully."
        );

        return "redirect:/vehicles";
    }

    // ===============================
    // Vehicle Details
    // ===============================

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public String vehicleDetail(@PathVariable Long id,
                                Model model) {

        User currentUser = securityUtils.getCurrentUser();

        Vehicle vehicle = vehicleService.getAuthorizedVehicle(id, currentUser);

        List<FaultPrediction> alerts =
                alertService.getAlertsByVehicle(id);

        alerts.forEach(alert ->
                alert.getExplanations().size());

        model.addAttribute("vehicle", vehicle);

        model.addAttribute(
                "sensorReadings",
                sensorService.getLatest50(id)
        );

        model.addAttribute(
                "maintenanceRecords",
                maintenanceService.getByVehicle(id)
        );

        model.addAttribute(
                "alerts",
                alerts
        );

        return "vehicle/detail";
    }

    // ===============================
    // Generate One Sensor Reading
    // ===============================

    @PostMapping("/{id}/simulate")
    public String simulateReading(@PathVariable Long id,
                                  RedirectAttributes ra) {
        Vehicle vehicle = vehicleService.getAuthorizedVehicle(
                id, securityUtils.getCurrentUser());

        dataSimulatorService.simulateForVehicle(vehicle);

        ra.addFlashAttribute(
                "successMessage",
                "One sensor reading generated successfully."
        );

        return "redirect:/vehicles/" + id;
    }

    // ===============================
    // Generate Historical Data
    // ===============================

    @PostMapping("/{id}/simulate/history")
    public String generateHistory(@PathVariable Long id,
                                  RedirectAttributes ra) {
        Vehicle vehicle = vehicleService.getAuthorizedVehicle(
                id, securityUtils.getCurrentUser());

        dataSimulatorService.generateHistoricalData(vehicle);

        ra.addFlashAttribute(
                "successMessage",
                "20 historical readings generated successfully."
        );

        return "redirect:/vehicles/" + id;
    }
}

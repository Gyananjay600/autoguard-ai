package com.autoguard.Controller;

import com.autoguard.dto.SensorUploadDTO;
import com.autoguard.Service.SensorService;
import com.autoguard.Service.VehicleService;
import com.autoguard.Model.User;
import com.autoguard.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/sensors")
@RequiredArgsConstructor
public class SensorController {

    private final SensorService sensorService;
    private final VehicleService vehicleService;
    private final SecurityUtils securityUtils;

    @GetMapping("/upload")
    public String uploadPage(Model model) {
        model.addAttribute("sensorDTO", new SensorUploadDTO());
        User currentUser = securityUtils.getCurrentUser();
        model.addAttribute("vehicles", securityUtils.isAdmin() || securityUtils.isEngineer()
                ? vehicleService.getAllVehicles()
                : vehicleService.getVehiclesByUser(currentUser));
        return "sensor/upload";
    }

    @PostMapping("/save")
    public String saveSensor(@Valid @ModelAttribute SensorUploadDTO sensorDTO) {
        vehicleService.verifyOwnership(sensorDTO.getVehicleId(),
                securityUtils.getCurrentUser());
        sensorService.save(sensorDTO);
        return "redirect:/vehicles/" + sensorDTO.getVehicleId();
    }
}

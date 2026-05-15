package com.autoguard.Controller;

import com.autoguard.dto.SensorUploadDTO;
import com.autoguard.Service.SensorService;
import com.autoguard.Service.VehicleService;
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

    @GetMapping("/upload")
    public String uploadPage(Model model) {
        model.addAttribute("sensorDTO", new SensorUploadDTO());
        model.addAttribute("vehicles", vehicleService.getAllVehicles());
        return "sensor/upload";
    }

    @PostMapping("/save")
    public String saveSensor(@Valid @ModelAttribute SensorUploadDTO sensorDTO) {
        sensorService.save(sensorDTO);
        return "redirect:/vehicles/" + sensorDTO.getVehicleId();
    }
}
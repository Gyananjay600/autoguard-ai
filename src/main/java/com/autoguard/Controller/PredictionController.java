package com.autoguard.Controller;

import com.autoguard.dto.PredictionResultDTO;
import com.autoguard.Service.PredictionService;
import com.autoguard.Service.VehicleService;
import com.autoguard.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;
    private final VehicleService vehicleService;
    private final SecurityUtils securityUtils;

    @PostMapping("/{vehicleId}/quick")
    public String runQuickAnalysis(@PathVariable Long vehicleId,
                                   Model model) {
        vehicleService.verifyOwnership(vehicleId, securityUtils.getCurrentUser());
        try {
            PredictionResultDTO result =
                    predictionService.runQuickAnalysis(vehicleId);
            model.addAttribute("result", result);
            model.addAttribute("vehicle",
                    vehicleService.findById(vehicleId));
            model.addAttribute("mode", "QUICK");
            return "prediction/result";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            model.addAttribute("vehicle",
                    vehicleService.findById(vehicleId));
            return "prediction/result";
        }
    }

    @PostMapping("/{vehicleId}/deep")
    public String runDeepDiagnostic(@PathVariable Long vehicleId,
                                    Model model) {
        vehicleService.verifyOwnership(vehicleId, securityUtils.getCurrentUser());
        try {
            PredictionResultDTO result =
                    predictionService.runDeepDiagnostic(vehicleId);
            model.addAttribute("result", result);
            model.addAttribute("vehicle",
                    vehicleService.findById(vehicleId));
            model.addAttribute("mode", "DEEP");
            return "prediction/result";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            model.addAttribute("vehicle",
                    vehicleService.findById(vehicleId));
            return "prediction/result";
        }
    }
}

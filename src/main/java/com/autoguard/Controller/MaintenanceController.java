package com.autoguard.Controller;

import com.autoguard.Service.MaintenanceService;
import com.autoguard.Service.VehicleService;
import com.autoguard.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final VehicleService vehicleService;
    private final SecurityUtils securityUtils;

    @PostMapping("/save")
    public String saveMaintenance(
            @RequestParam Long vehicleId,
            @RequestParam String action,
            @RequestParam String notes,
            RedirectAttributes ra) {
        vehicleService.verifyOwnership(vehicleId, securityUtils.getCurrentUser());
        maintenanceService.save(vehicleId, action, notes);
        ra.addFlashAttribute("successMessage",
                "Maintenance record logged successfully.");
        return "redirect:/vehicles/" + vehicleId;
    }

    // Changed from GET to POST for proper HTTP semantics
    @PostMapping("/{id}/done")
    public String markDone(@PathVariable Long id,
                           @RequestParam Long vehicleId,
                           RedirectAttributes ra) {
        vehicleService.verifyOwnership(vehicleId, securityUtils.getCurrentUser());
        maintenanceService.markRepairDone(id, vehicleId);
        ra.addFlashAttribute("successMessage",
                "Repair marked as done.");
        return "redirect:/vehicles/" + vehicleId;
    }
}

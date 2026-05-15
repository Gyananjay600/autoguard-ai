package com.autoguard.Controller;

import com.autoguard.Service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping("/save")
    public String saveMaintenance(@RequestParam Long vehicleId,
                                  @RequestParam String action,
                                  @RequestParam String notes) {
        maintenanceService.save(vehicleId, action, notes);
        return "redirect:/vehicles/" + vehicleId;
    }

    @PostMapping("/{id}/done")
    public String markDone(@PathVariable Long id,
                           @RequestParam Long vehicleId) {
        maintenanceService.markRepairDone(id);
        return "redirect:/vehicles/" + vehicleId;
    }
}

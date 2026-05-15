package com.autoguard.Controller;

import com.autoguard.Model.User;
import com.autoguard.security.SecurityUtils;
import com.autoguard.Service.DashboardService;
import com.autoguard.Service.VehicleService;
import com.autoguard.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final VehicleService vehicleService;
    private final SecurityUtils securityUtils;

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        User currentUser = securityUtils.getCurrentUser();
        model.addAttribute("summary", dashboardService.getSummary());
        model.addAttribute("user", currentUser);

        if (currentUser.getRole() == UserRole.OWNER) {
            model.addAttribute("vehicles",
                    vehicleService.getVehiclesByUser(currentUser));
        } else {
            model.addAttribute("vehicles",
                    vehicleService.getAllVehicles());
        }
        return "dashboard/home";
    }
}
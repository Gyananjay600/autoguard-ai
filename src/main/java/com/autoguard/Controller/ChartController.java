package com.autoguard.Controller;

import com.autoguard.Model.SensorReading;
import com.autoguard.Service.SensorService;
import com.autoguard.Service.VehicleService;
import com.autoguard.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/charts")
@RequiredArgsConstructor
public class ChartController {

    private final SensorService sensorService;
    private final VehicleService vehicleService;
    private final SecurityUtils securityUtils;

    @GetMapping("/vehicle/{id}/sensors")
    public Map<String, Object> getSensorChartData(
            @PathVariable Long id) {

        vehicleService.verifyOwnership(id, securityUtils.getCurrentUser());

        List<SensorReading> readings =
                sensorService.getLatest50(id);

        // Reverse to show oldest first on chart
        java.util.Collections.reverse(readings);

        Map<String, Object> data = new HashMap<>();

        // Labels (timestamps)
        List<String> labels = readings.stream()
                .map(r -> r.getTimestamp() != null
                        ? r.getTimestamp().toLocalTime()
                        .toString().substring(0, 8)
                        : "")
                .collect(Collectors.toList());

        // Engine temperature
        List<Double> temps = readings.stream()
                .map(r -> r.getEngineTemp() != null
                        ? r.getEngineTemp() : 0.0)
                .collect(Collectors.toList());

        // RPM
        List<Double> rpms = readings.stream()
                .map(r -> r.getRpm() != null
                        ? r.getRpm() : 0.0)
                .collect(Collectors.toList());

        // Oil pressure
        List<Double> oils = readings.stream()
                .map(r -> r.getOilPressure() != null
                        ? r.getOilPressure() : 0.0)
                .collect(Collectors.toList());

        // Vibration
        List<Double> vibs = readings.stream()
                .map(r -> r.getVibration() != null
                        ? r.getVibration() : 0.0)
                .collect(Collectors.toList());

        data.put("labels",      labels);
        data.put("engineTemp",  temps);
        data.put("rpm",         rpms);
        data.put("oilPressure", oils);
        data.put("vibration",   vibs);
        data.put("count",       readings.size());

        return data;
    }
}

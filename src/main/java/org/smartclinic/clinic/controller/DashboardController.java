package org.smartclinic.clinic.controller;

import org.smartclinic.clinic.Dto.ActivityItemDTO;
import org.smartclinic.clinic.Dto.DashboardStatsDTO;
import org.smartclinic.clinic.Dto.InsightsDTO;
import org.smartclinic.clinic.Dto.TrendPointDTO;
import org.smartclinic.clinic.service.DashboardService;
import org.smartclinic.clinic.util.ClinicLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/dashboard")
public class DashboardController {

    private final ClinicLogger logger = ClinicLogger.getInstance();

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        logger.info("GET /api/owner/dashboard/stats");
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/trend/appointments")
    public ResponseEntity<List<TrendPointDTO>> getAppointmentTrend(
            @RequestParam(defaultValue = "monthly") String period) {
        logger.info("GET /api/owner/dashboard/trend/appointments?period=" + period);
        return ResponseEntity.ok(dashboardService.getAppointmentTrend(period));
    }

    @GetMapping("/trend/patients")
    public ResponseEntity<List<TrendPointDTO>> getPatientGrowth() {
        logger.info("GET /api/owner/dashboard/trend/patients");
        return ResponseEntity.ok(dashboardService.getPatientGrowth());
    }

    @GetMapping("/insights")
    public ResponseEntity<InsightsDTO> getInsights() {
        logger.info("GET /api/owner/dashboard/insights");
        return ResponseEntity.ok(dashboardService.getInsights());
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityItemDTO>> getActivity(
            @RequestParam(defaultValue = "10") int limit) {
        if (limit < 1 || limit > 50) limit = 10;
        logger.info("GET /api/owner/dashboard/activity?limit=" + limit);
        return ResponseEntity.ok(dashboardService.getRecentActivity(limit));
    }
}

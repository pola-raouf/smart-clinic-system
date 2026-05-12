package org.smartclinic.clinic.controller;

import org.smartclinic.clinic.Dto.ReportAnalyticsDTO;
import org.smartclinic.clinic.Dto.ReportTableRowDTO;
import org.smartclinic.clinic.Dto.TrendPointDTO;
import org.smartclinic.clinic.service.ReportAnalyticsService;
import org.smartclinic.clinic.util.ClinicLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/owner/reports")
public class ReportAnalyticsController {

    private final ClinicLogger logger = ClinicLogger.getInstance();

    @Autowired
    private ReportAnalyticsService reportAnalyticsService;

    @GetMapping("/kpis")
    public ResponseEntity<ReportAnalyticsDTO> getKpis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long doctorId) {
        logger.info("GET /api/owner/reports/kpis from=" + from + " to=" + to);
        return ResponseEntity.ok(reportAnalyticsService.getKpis(from, to, doctorId));
    }

    @GetMapping("/trend/appointments")
    public ResponseEntity<List<TrendPointDTO>> getAppointmentTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(reportAnalyticsService.getAppointmentTrend(from, to, doctorId));
    }

    @GetMapping("/trend/patients")
    public ResponseEntity<List<TrendPointDTO>> getPatientGrowth() {
        return ResponseEntity.ok(reportAnalyticsService.getPatientGrowth());
    }

    @GetMapping("/table")
    public ResponseEntity<List<ReportTableRowDTO>> getTableRows(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(reportAnalyticsService.getTableRows(from, to, doctorId));
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long doctorId,
            Authentication authentication) {
        byte[] pdf = reportAnalyticsService.exportPdf(from, to, doctorId, authentication.getName());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"clinic-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long doctorId,
            Authentication authentication) {
        byte[] csv = reportAnalyticsService.exportCsv(from, to, doctorId, authentication.getName());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"clinic-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}

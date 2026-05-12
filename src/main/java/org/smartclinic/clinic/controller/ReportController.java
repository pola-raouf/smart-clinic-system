package org.smartclinic.clinic.controller;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.service.ReportExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportExportService reportExportService;

    @GetMapping("/{appointmentId}/export")
    public ResponseEntity<byte[]> exportPdf(
            Authentication authentication,
            @PathVariable Long appointmentId) {
        byte[] pdf = reportExportService.exportAppointmentReportPdf(
                authentication.getName(), appointmentId);
        String filename = "visit-report-" + appointmentId + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}

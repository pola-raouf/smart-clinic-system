package org.smartclinic.clinic.controller;

import org.smartclinic.clinic.Dto.MedicalRecordDetailDTO;
import org.smartclinic.clinic.Dto.MedicalRecordResponseDTO;
import org.smartclinic.clinic.service.PatientMedicalReportService;
import org.smartclinic.clinic.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private PatientMedicalReportService patientMedicalReportService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(patientService.getMyProfile(authentication.getName()));
    }

    @GetMapping("/me/medical-reports")
    public ResponseEntity<List<MedicalRecordResponseDTO>> listMyMedicalReports(Authentication authentication) {
        return ResponseEntity.ok(patientMedicalReportService.listMyVisitReports(authentication.getName()));
    }

    @GetMapping("/me/medical-reports/appointment/{appointmentId}")
    public ResponseEntity<MedicalRecordDetailDTO> getMedicalRecordByAppointment(
            Authentication authentication,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(
                patientMedicalReportService.getRecordByAppointment(authentication.getName(), appointmentId));
    }
}

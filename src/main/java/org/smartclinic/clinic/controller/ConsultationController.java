package org.smartclinic.clinic.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.MedicalHistoryResponseDTO;
import org.smartclinic.clinic.Dto.MedicalRecordRequestDTO;
import org.smartclinic.clinic.Dto.MedicalRecordResponseDTO;
import org.smartclinic.clinic.Dto.PrescriptionRequestDTO;
import org.smartclinic.clinic.Dto.PrescriptionResponseDTO;
import org.smartclinic.clinic.service.consultation.ConsultationFacade;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/doctor/me")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationFacade consultationFacade;

    
    @PostMapping("/diagnoses")
    public ResponseEntity<MedicalRecordResponseDTO> addDiagnosis(
            Authentication authentication,
            @Valid @RequestBody MedicalRecordRequestDTO dto) {
        return ResponseEntity.ok(
                consultationFacade.addDiagnosis(authentication.getName(), dto));
    }

    
    @PostMapping("/prescriptions")
    public ResponseEntity<PrescriptionResponseDTO> addPrescription(
            Authentication authentication,
            @Valid @RequestBody PrescriptionRequestDTO dto) {
        return ResponseEntity.ok(
                consultationFacade.addPrescription(authentication.getName(), dto));
    }

   
    @GetMapping("/patient/{patientId}/history")
    public ResponseEntity<MedicalHistoryResponseDTO> getMedicalHistory(
            Authentication authentication,
            @PathVariable Long patientId) {
        return ResponseEntity.ok(
                consultationFacade.getMedicalHistory(authentication.getName(), patientId));
    }
}

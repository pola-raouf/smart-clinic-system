package org.smartclinic.clinic.controller;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.DoctorPatientProfileAggregateDTO;
import org.smartclinic.clinic.Dto.DoctorPatientSummaryDTO;
import org.smartclinic.clinic.Dto.DoctorResponseDTO;
import org.smartclinic.clinic.Dto.DoctorScheduleDto;
import org.smartclinic.clinic.Dto.MedicalRecordResponseDTO;
import org.smartclinic.clinic.service.DoctorService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<DoctorResponseDTO>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponseDTO> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/me/patients")
    public ResponseEntity<List<DoctorPatientSummaryDTO>> getMyPatients(Authentication authentication) {
        return ResponseEntity.ok(doctorService.getMyPatientSummaries(authentication.getName()));
    }

    @GetMapping("/me/schedule/{date}")
    public ResponseEntity<List<DoctorScheduleDto>> getMyScheduleForDate(
            Authentication authentication,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(doctorService.getMyScheduleForDate(authentication.getName(), date));
    }

    @GetMapping("/me/patient/{patientId}/profile")
    public ResponseEntity<DoctorPatientProfileAggregateDTO> getPatientProfileForDoctor(
            Authentication authentication,
            @PathVariable Long patientId) {
        return ResponseEntity.ok(
                doctorService.getPatientProfileForDoctor(authentication.getName(), patientId));
    }

    @GetMapping("/me/medical-records")
    public ResponseEntity<List<MedicalRecordResponseDTO>> getMyMedicalRecords(
            Authentication authentication) {
        return ResponseEntity.ok(doctorService.getMyMedicalRecords(authentication.getName()));
    }
}

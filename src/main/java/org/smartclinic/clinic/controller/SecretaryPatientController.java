package org.smartclinic.clinic.controller;

import org.smartclinic.clinic.Dto.PatientResponseDTO;
import org.smartclinic.clinic.Dto.RegisterRequestDTO;
import org.smartclinic.clinic.Dto.SecretaryPatientUpdateDTO;
import org.smartclinic.clinic.service.SecretaryPatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/secretary/patients")
public class SecretaryPatientController {

    @Autowired
    private SecretaryPatientService secretaryPatientService;

    @GetMapping
    public ResponseEntity<List<PatientResponseDTO>> list() {
        return ResponseEntity.ok(secretaryPatientService.listPatients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponseDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(secretaryPatientService.getPatient(id));
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody RegisterRequestDTO dto) {
        secretaryPatientService.registerPatient(dto);
        return ResponseEntity.ok("Patient registered successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponseDTO> update(
            @PathVariable Long id,
            @RequestBody SecretaryPatientUpdateDTO dto) {
        return ResponseEntity.ok(secretaryPatientService.updatePatient(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        secretaryPatientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}

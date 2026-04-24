package org.smartclinic.clinic.controller;

import org.smartclinic.clinic.Dto.PatientResponseDTO;
import org.smartclinic.clinic.service.PatientService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(patientService.getMyProfile(email));
    }
}
package org.smartclinic.clinic.service;

import org.smartclinic.clinic.Dto.PatientResponseDTO;
import org.smartclinic.clinic.Entity.Patient;
import org.smartclinic.clinic.Entity.User;
import org.smartclinic.clinic.Mapper.PatientMapper;
import org.smartclinic.clinic.Repository.PatientRepository;
import org.smartclinic.clinic.Repository.UserRepository;
import org.smartclinic.clinic.exception.ApiException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    public PatientResponseDTO getMyProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Patient not found"));

        return PatientMapper.toDTO(patient);
    }
}
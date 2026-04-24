package org.smartclinic.clinic.service;

import org.smartclinic.clinic.Dto.UserProfileDTO;
import org.smartclinic.clinic.Entity.*;
import org.smartclinic.clinic.Repository.*;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private SecretaryRepository secretaryRepository;

    public UserProfileDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        return switch (user.getRole()) {
            case PATIENT -> buildPatientProfile(user);
            case DOCTOR -> buildDoctorProfile(user);
            case OWNER -> buildOwnerProfile(user);
            case SECRETARY -> buildSecretaryProfile(user);
        };
    }

    private UserProfileDTO buildPatientProfile(User user) {
        Patient p = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Patient not found"));
        return UserProfileDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .gender(p.getGender() != null ? p.getGender().name() : null)
                .dateOfBirth(p.getDateOfBirth())
                .phoneNumber(p.getPhoneNumber())
                .address(p.getAddress())
                .build();
    }

    private UserProfileDTO buildDoctorProfile(User user) {
        Doctor d = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Doctor not found"));
        return UserProfileDTO.builder()
                .id(d.getId())
                .name(d.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .specialty(d.getSpecialty())
                .build();
    }

    private UserProfileDTO buildOwnerProfile(User user) {
        Owner o = ownerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Owner not found"));
        return UserProfileDTO.builder()
                .id(o.getId())
                .name(o.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    private UserProfileDTO buildSecretaryProfile(User user) {
        Secretary s = secretaryRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Secretary not found"));
        return UserProfileDTO.builder()
                .id(s.getId())
                .name(s.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}

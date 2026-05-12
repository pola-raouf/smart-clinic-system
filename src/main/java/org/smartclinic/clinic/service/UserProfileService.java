package org.smartclinic.clinic.service;

import org.smartclinic.clinic.Dto.UserProfileDTO;
import org.smartclinic.clinic.Entity.*;
import org.smartclinic.clinic.Repository.*;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

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

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

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
                .profileImageUrl(user.getProfileImageUrl())
                .visitCount(p.getVisitCount())
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
                .profileImageUrl(user.getProfileImageUrl())
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
                .profileImageUrl(user.getProfileImageUrl())
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
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    @Transactional
    public UserProfileDTO updateProfilePhoto(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("Image file is required.");
        }
        String ct = file.getContentType();
        if (ct == null
                || (!ct.equals("image/jpeg") && !ct.equals("image/png") && !ct.equals("image/webp"))) {
            throw new ApiException("Only JPEG, PNG, or WebP images are allowed.");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));
        String ext = ct.contains("png") ? ".png" : (ct.contains("webp") ? ".webp" : ".jpg");
        String relative = "profiles/" + user.getId() + "-" + UUID.randomUUID() + ext;
        try {
            Path base = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path dir = base.resolve("profiles");
            Files.createDirectories(dir);
            Path target = base.resolve(relative);
            file.transferTo(target);
        } catch (Exception e) {
            throw new ApiException("Could not store profile photo.");
        }
        user.setProfileImageUrl("/uploads/" + relative.replace("\\", "/"));
        userRepository.save(user);
        return getProfile(email);
    }

    @Transactional
    public UserProfileDTO deleteProfilePhoto(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));
        user.setProfileImageUrl(null);
        userRepository.save(user);
        return getProfile(email);
    }

    @Transactional
    public UserProfileDTO updateProfile(String email, UserProfileDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        try {
            switch (user.getRole()) {
                case PATIENT -> {
                    Patient p = patientRepository.findByUserId(user.getId())
                            .orElseThrow(() -> new ApiException("Patient not found"));
                    if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
                        p.setName(dto.getName());
                    }
                    if (dto.getGender() != null && !dto.getGender().trim().isEmpty()) {
                        try {
                            p.setGender(Gender.valueOf(dto.getGender().toUpperCase()));
                        } catch (Exception ignored) {
                        }
                    }
                    if (dto.getDateOfBirth() != null) {
                        p.setDateOfBirth(dto.getDateOfBirth());
                    }
                    if (dto.getPhoneNumber() != null)
                        p.setPhoneNumber(dto.getPhoneNumber());
                    if (dto.getAddress() != null)
                        p.setAddress(dto.getAddress());
                    patientRepository.save(p);
                }
                case DOCTOR -> {
                    Doctor d = doctorRepository.findByUserId(user.getId())
                            .orElseThrow(() -> new ApiException("Doctor not found"));
                    if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
                        d.setName(dto.getName());
                    }
                    doctorRepository.save(d);
                }
                case OWNER -> {
                    Owner o = ownerRepository.findByUserId(user.getId())
                            .orElseThrow(() -> new ApiException("Owner not found"));
                    if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
                        o.setName(dto.getName());
                    }
                    ownerRepository.save(o);
                }
                case SECRETARY -> {
                    Secretary s = secretaryRepository.findByUserId(user.getId())
                            .orElseThrow(() -> new ApiException("Secretary not found"));
                    if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
                        s.setName(dto.getName());
                    }
                    secretaryRepository.save(s);
                }
            }
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException("Could not update profile: " + e.getMessage());
        }
        return getProfile(email);
    }
}

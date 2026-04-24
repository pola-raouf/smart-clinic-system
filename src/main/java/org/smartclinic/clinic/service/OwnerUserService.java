package org.smartclinic.clinic.service;

import org.smartclinic.clinic.Dto.AdminUserCreateDTO;
import org.smartclinic.clinic.Dto.AdminUserDetailDTO;
import org.smartclinic.clinic.Dto.AdminUserUpdateDTO;
import org.smartclinic.clinic.Dto.RegisterRequestDTO;
import org.smartclinic.clinic.Entity.*;
import org.smartclinic.clinic.Repository.*;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OwnerUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SecretaryRepository secretaryRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    public List<AdminUserDetailDTO> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toDetail)
                .toList();
    }

    private AdminUserDetailDTO toDetail(User u) {
        AdminUserDetailDTO.AdminUserDetailDTOBuilder b = AdminUserDetailDTO.builder()
                .userId(u.getId())
                .email(u.getEmail())
                .role(u.getRole().name());
        switch (u.getRole()) {
            case PATIENT -> patientRepository.findByUserId(u.getId()).ifPresent(p ->
                    b.patientRecordId(p.getId())
                            .patientName(p.getName())
                            .gender(p.getGender() != null ? p.getGender().name() : null)
                            .dateOfBirth(p.getDateOfBirth() != null ? p.getDateOfBirth().toString() : null)
                            .phoneNumber(p.getPhoneNumber())
                            .address(p.getAddress()));
            case DOCTOR -> doctorRepository.findByUserId(u.getId()).ifPresent(d ->
                    b.doctorRecordId(d.getId()).doctorName(d.getName()).specialty(d.getSpecialty()));
            case SECRETARY -> secretaryRepository.findByUserId(u.getId()).ifPresent(s ->
                    b.secretaryRecordId(s.getId()).secretaryName(s.getName()));
            case OWNER -> ownerRepository.findByUserId(u.getId()).ifPresent(o ->
                    b.ownerRecordId(o.getId()).ownerName(o.getName()));
        }
        return b.build();
    }

    @Transactional
    public void createUser(AdminUserCreateDTO dto) {
        if (dto.getEmail() == null || dto.getEmail().isBlank()
                || dto.getPassword() == null || dto.getPassword().isBlank()
                || dto.getRole() == null) {
            throw new ApiException("email, password and role are required");
        }
        if (userRepository.findByEmail(dto.getEmail().trim()).isPresent()) {
            throw new ApiException("Email already exists");
        }

        switch (dto.getRole()) {
            case PATIENT -> {
                if (dto.getName() == null || dto.getGender() == null
                        || dto.getDateOfBirth() == null || dto.getPhoneNumber() == null) {
                    throw new ApiException("Patient requires name, gender, dateOfBirth, phoneNumber");
                }
                RegisterRequestDTO r = new RegisterRequestDTO();
                r.setEmail(dto.getEmail().trim());
                r.setPassword(dto.getPassword());
                r.setName(dto.getName());
                r.setGender(dto.getGender());
                r.setDateOfBirth(dto.getDateOfBirth());
                r.setPhoneNumber(dto.getPhoneNumber());
                r.setAddress(dto.getAddress());
                authService.registerPatient(r);
            }
            case DOCTOR -> {
                if (dto.getName() == null || dto.getSpecialty() == null) {
                    throw new ApiException("Doctor requires name and specialty");
                }
                User u = new User();
                u.setEmail(dto.getEmail().trim());
                u.setPassword(passwordEncoder.encode(dto.getPassword()));
                u.setRole(Role.DOCTOR);
                Doctor d = new Doctor();
                d.setName(dto.getName());
                d.setSpecialty(dto.getSpecialty());
                d.setUser(u);
                doctorRepository.save(d);
            }
            case SECRETARY -> {
                if (dto.getName() == null) {
                    throw new ApiException("Secretary requires name");
                }
                User u = new User();
                u.setEmail(dto.getEmail().trim());
                u.setPassword(passwordEncoder.encode(dto.getPassword()));
                u.setRole(Role.SECRETARY);
                Secretary s = new Secretary();
                s.setName(dto.getName());
                s.setUser(u);
                secretaryRepository.save(s);
            }
            case OWNER -> {
                if (dto.getName() == null) {
                    throw new ApiException("Owner requires name");
                }
                User u = new User();
                u.setEmail(dto.getEmail().trim());
                u.setPassword(passwordEncoder.encode(dto.getPassword()));
                u.setRole(Role.OWNER);
                Owner o = new Owner();
                o.setName(dto.getName());
                o.setUser(u);
                ownerRepository.save(o);
            }
        }
    }

    @Transactional
    public void updateUser(Long userId, AdminUserUpdateDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            String next = dto.getEmail().trim();
            if (!next.equalsIgnoreCase(user.getEmail())
                    && userRepository.findByEmail(next).isPresent()) {
                throw new ApiException("Email already exists");
            }
            user.setEmail(next);
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getName() != null && !dto.getName().isBlank()) {
            applyProfileName(user, dto.getName().trim());
        }
        userRepository.save(user);
    }

    private void applyProfileName(User user, String name) {
        switch (user.getRole()) {
            case PATIENT -> patientRepository.findByUserId(user.getId()).ifPresent(p -> {
                p.setName(name);
                patientRepository.save(p);
            });
            case DOCTOR -> doctorRepository.findByUserId(user.getId()).ifPresent(d -> {
                d.setName(name);
                doctorRepository.save(d);
            });
            case SECRETARY -> secretaryRepository.findByUserId(user.getId()).ifPresent(s -> {
                s.setName(name);
                secretaryRepository.save(s);
            });
            case OWNER -> ownerRepository.findByUserId(user.getId()).ifPresent(o -> {
                o.setName(name);
                ownerRepository.save(o);
            });
        }
    }

    @Transactional
    public void deleteUser(Long userId, String currentOwnerEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));
        if (user.getEmail().equalsIgnoreCase(currentOwnerEmail)) {
            throw new ApiException("Cannot delete your own account");
        }
        switch (user.getRole()) {
            case PATIENT -> patientRepository.findByUserId(user.getId())
                    .ifPresent(patientRepository::delete);
            case DOCTOR -> doctorRepository.findByUserId(user.getId())
                    .ifPresent(doctorRepository::delete);
            case SECRETARY -> secretaryRepository.findByUserId(user.getId())
                    .ifPresent(secretaryRepository::delete);
            case OWNER -> ownerRepository.findByUserId(user.getId())
                    .ifPresent(ownerRepository::delete);
        }
    }
}

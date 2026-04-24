package org.smartclinic.clinic.service;

import org.smartclinic.clinic.Dto.LoginRequestDTO;
import org.smartclinic.clinic.Dto.RegisterRequestDTO;
import org.smartclinic.clinic.Dto.AuthResponseDTO;
import org.smartclinic.clinic.Entity.Patient;
import org.smartclinic.clinic.Entity.Role;
import org.smartclinic.clinic.Entity.User;
import org.smartclinic.clinic.Mapper.PatientMapper;
import org.smartclinic.clinic.Mapper.UserMapper;
import org.smartclinic.clinic.Repository.PatientRepository;
import org.smartclinic.clinic.Repository.UserRepository;
import org.smartclinic.clinic.exception.ApiException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid credentials");
        }
        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponseDTO(token, user.getRole().name());
    }

    // 📝 REGISTER (PATIENT ONLY) — public self-service
    @Transactional
    public void register(RegisterRequestDTO dto) {
        registerPatient(dto);
    }

    /** Used by public register, secretary, and owner when creating a patient account. */
    @Transactional
    public void registerPatient(RegisterRequestDTO dto) {

        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new ApiException("Email already exists");
        }

        User user = UserMapper.toEntity(dto, Role.PATIENT);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        Patient patient = PatientMapper.toEntity(dto, user);

        patientRepository.save(patient);
    }
}
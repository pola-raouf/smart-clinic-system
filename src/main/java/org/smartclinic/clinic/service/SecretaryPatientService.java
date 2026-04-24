package org.smartclinic.clinic.service;

import org.smartclinic.clinic.Dto.PatientResponseDTO;
import org.smartclinic.clinic.Dto.RegisterRequestDTO;
import org.smartclinic.clinic.Dto.SecretaryPatientUpdateDTO;
import org.smartclinic.clinic.Entity.Patient;
import org.smartclinic.clinic.Entity.User;
import org.smartclinic.clinic.Mapper.PatientMapper;
import org.smartclinic.clinic.Repository.PatientRepository;
import org.smartclinic.clinic.Repository.UserRepository;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SecretaryPatientService {

    @Autowired
    private AuthService authService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<PatientResponseDTO> listPatients() {
        return patientRepository.findAllWithUsers().stream()
                .map(PatientMapper::toDTO)
                .toList();
    }

    public PatientResponseDTO getPatient(Long id) {
        return patientRepository.findById(id)
                .map(PatientMapper::toDTO)
                .orElseThrow(() -> new ApiException("Patient not found"));
    }

    @Transactional
    public void registerPatient(RegisterRequestDTO dto) {
        authService.registerPatient(dto);
    }

    @Transactional
    public PatientResponseDTO updatePatient(Long id, SecretaryPatientUpdateDTO patch) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ApiException("Patient not found"));
        User user = patient.getUser();

        if (patch.getName() != null) {
            patient.setName(patch.getName());
        }
        if (patch.getGender() != null) {
            patient.setGender(patch.getGender());
        }
        if (patch.getDateOfBirth() != null) {
            patient.setDateOfBirth(patch.getDateOfBirth());
        }
        if (patch.getPhoneNumber() != null) {
            patient.setPhoneNumber(patch.getPhoneNumber());
        }
        if (patch.getAddress() != null) {
            patient.setAddress(patch.getAddress());
        }

        if (patch.getEmail() != null && !patch.getEmail().isBlank()) {
            String next = patch.getEmail().trim();
            if (!next.equalsIgnoreCase(user.getEmail())
                    && userRepository.findByEmail(next).isPresent()) {
                throw new ApiException("Email already exists");
            }
            user.setEmail(next);
        }
        if (patch.getPassword() != null && !patch.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(patch.getPassword()));
        }

        patientRepository.save(patient);
        return PatientMapper.toDTO(patient);
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ApiException("Patient not found"));
        patientRepository.delete(patient);
    }
}

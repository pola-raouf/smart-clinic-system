package org.smartclinic.clinic.Mapper;

import org.smartclinic.clinic.Entity.Patient;
import org.smartclinic.clinic.Entity.User;
import org.smartclinic.clinic.Dto.*;

public class PatientMapper {

    // 🔹 for admin / create patient
    public static Patient toEntity(PatientRequestDTO dto, User user) {

        Patient patient = new Patient();
        patient.setName(dto.getName());
        patient.setGender(dto.getGender()); // ✅ FIXED
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setAddress(dto.getAddress());
        patient.setUser(user);

        return patient;
    }

    // 🔥 for REGISTER
    public static Patient toEntity(RegisterRequestDTO dto, User user) {

        Patient patient = new Patient();
        patient.setName(dto.getName());
        patient.setGender(dto.getGender()); // ✅ FIXED
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setAddress(dto.getAddress());
        patient.setUser(user);

        return patient;
    }

    // 🔹 response
    public static PatientResponseDTO toDTO(Patient patient) {

        PatientResponseDTO dto = new PatientResponseDTO();
        dto.setId(patient.getId());
        dto.setName(patient.getName());
        if (patient.getGender() != null) {
            dto.setGender(patient.getGender().name());
        }
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setPhoneNumber(patient.getPhoneNumber());
        dto.setAddress(patient.getAddress());

        if (patient.getUser() != null) {
            dto.setUserId(patient.getUser().getId());
            dto.setEmail(patient.getUser().getEmail()); // 🔥 مهم
        }

        dto.setVisitCount(patient.getVisitCount());

        return dto;
    }
}
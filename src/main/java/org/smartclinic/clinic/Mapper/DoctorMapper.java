package org.smartclinic.clinic.Mapper;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Entity.User;
import org.smartclinic.clinic.Dto.*;
public class DoctorMapper {

    public static Doctor toEntity(DoctorRequestDTO dto, User user) {
        Doctor doctor = new Doctor();
        doctor.setName(dto.getName());
        doctor.setSpecialty(dto.getSpecialty());
        doctor.setUser(user);
        return doctor;
    }

    public static DoctorResponseDTO toDTO(Doctor doctor) {
        DoctorResponseDTO dto = new DoctorResponseDTO();
        dto.setId(doctor.getId());
        dto.setName(doctor.getName());
        dto.setSpecialty(doctor.getSpecialty());

        if (doctor.getUser() != null) {
            dto.setUserId(doctor.getUser().getId());
        }

        return dto;
    }
}
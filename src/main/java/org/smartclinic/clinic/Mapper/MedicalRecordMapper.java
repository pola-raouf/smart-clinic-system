package org.smartclinic.clinic.Mapper;

import org.smartclinic.clinic.Entity.*;
import org.smartclinic.clinic.Dto.*;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

public class MedicalRecordMapper {

    public static MedicalRecord toEntity(MedicalRecordRequestDTO dto, Doctor doctor, Patient patient, Appointment appointment) {
        MedicalRecord m = new MedicalRecord();
        m.setChiefComplaint(dto.getChiefComplaint());
        m.setDiagnosis(dto.getDiagnosis());
        m.setNotes(dto.getNotes());
        m.setDoctor(doctor);
        m.setPatient(patient);
        m.setAppointment(appointment);
        m.setCreatedAt(LocalDateTime.now());
        return m;
    }

    public static MedicalRecordResponseDTO toDTO(MedicalRecord m) {
        MedicalRecordResponseDTO dto = new MedicalRecordResponseDTO();
        dto.setId(m.getId());
        dto.setChiefComplaint(m.getChiefComplaint());
        dto.setDiagnosis(m.getDiagnosis());
        dto.setNotes(m.getNotes());
        dto.setCreatedAt(m.getCreatedAt());

        dto.setDoctorId(m.getDoctor().getId());
        dto.setPatientId(m.getPatient().getId());

        if (m.getAppointment() != null) {
            dto.setAppointmentId(m.getAppointment().getId());
        }

        return dto;
    }
}
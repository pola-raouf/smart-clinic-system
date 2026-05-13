package org.smartclinic.clinic.Mapper;

import org.smartclinic.clinic.Dto.MedicalRecordRequestDTO;
import org.smartclinic.clinic.Dto.MedicalRecordResponseDTO;
import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Entity.MedicalRecord;
import org.smartclinic.clinic.Entity.Patient;

import java.time.LocalDateTime;

public class MedicalRecordMapper {

    public static MedicalRecord toEntity(MedicalRecordRequestDTO dto, Doctor doctor, Patient patient, Appointment appointment) {
        MedicalRecord m = new MedicalRecord();
        m.setChiefComplaint(dto.getChiefComplaint());
        m.setSymptoms(dto.getSymptoms());
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
        dto.setSymptoms(m.getSymptoms());
        dto.setDiagnosis(m.getDiagnosis());
        dto.setNotes(m.getNotes());
        dto.setCreatedAt(m.getCreatedAt());

        if (m.getDoctor() != null) {
            dto.setDoctorId(m.getDoctor().getId());
            dto.setDoctorName(m.getDoctor().getName());
        }
        if (m.getPatient() != null) {
            dto.setPatientId(m.getPatient().getId());
            dto.setPatientName(m.getPatient().getName());
        }

        if (m.getAppointment() != null) {
            dto.setAppointmentId(m.getAppointment().getId());
            dto.setVisitDate(m.getAppointment().getDate());
            dto.setVisitTime(m.getAppointment().getTime());
        }

        return dto;
    }
}

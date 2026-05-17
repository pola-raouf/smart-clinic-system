package org.smartclinic.clinic.Mapper;

import org.smartclinic.clinic.Entity.*;
import org.smartclinic.clinic.Dto.*;

import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentMapper {

  
    public static Appointment toEntity(LocalDate date, LocalTime time, Doctor doctor, Patient patient) {
        Appointment app = new Appointment();
        app.setDate(date);
        app.setTime(time);
        app.setStatus(AppointmentStatus.BOOKED);
        app.setDoctor(doctor);
        app.setPatient(patient);
        return app;
    }

    public static AppointmentResponseDTO toDTO(Appointment app) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        if (app == null) {
            return dto;
        }
        dto.setId(app.getId());
        if (app.getDoctor() != null) {
            dto.setDoctorId(app.getDoctor().getId());
            dto.setDoctorName(app.getDoctor().getName());
            dto.setSpecialty(app.getDoctor().getSpecialty());
        }
        if (app.getPatient() != null) {
            dto.setPatientId(app.getPatient().getId());
            dto.setPatientName(app.getPatient().getName());
        }
        dto.setDate(app.getDate());
        dto.setTime(app.getTime());
        dto.setStatus(app.getStatus());
        return dto;
    }
}


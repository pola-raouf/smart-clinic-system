package org.smartclinic.clinic.Mapper;

import org.smartclinic.clinic.Entity.*;
import org.smartclinic.clinic.Dto.*;

import java.time.LocalDate;

public class AppointmentMapper {

    public static Appointment toEntity(LocalDate date, Doctor doctor, Patient patient) {
        Appointment app = new Appointment();
        app.setDate(date);
        app.setStatus(AppointmentStatus.BOOKED);
        app.setDoctor(doctor);
        app.setPatient(patient);
        return app;
    }

    public static AppointmentResponseDTO toDTO(Appointment app) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(app.getId());
        dto.setDate(app.getDate());
        dto.setStatus(app.getStatus());
        dto.setDoctorId(app.getDoctor().getId());
        dto.setPatientId(app.getPatient().getId());
        return dto;
    }
}

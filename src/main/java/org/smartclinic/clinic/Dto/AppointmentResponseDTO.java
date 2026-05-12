package org.smartclinic.clinic.Dto;

import lombok.*;
import org.smartclinic.clinic.Entity.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AppointmentResponseDTO {

    private Long id;
    private Long doctorId;
    private String doctorName;
    private String specialty;
    private Long patientId;
    private String patientName;
    private LocalDate date;
    private LocalTime time;
    private AppointmentStatus status;
}

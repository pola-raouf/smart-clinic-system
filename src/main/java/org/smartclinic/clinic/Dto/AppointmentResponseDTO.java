package org.smartclinic.clinic.Dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.smartclinic.clinic.Entity.AppointmentStatus;

import java.time.LocalDate;
@Getter
@Setter
@Data
public class AppointmentResponseDTO {

    private Long id;
    private LocalDate date;
    private AppointmentStatus status;

    private Long doctorId;
    private Long patientId;
}

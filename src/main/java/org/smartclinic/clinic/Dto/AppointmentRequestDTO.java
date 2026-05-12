package org.smartclinic.clinic.Dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Data
public class AppointmentRequestDTO {

    @NotNull
    private Long doctorId;

    @NotNull
    private Long patientId;

    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime time;
}

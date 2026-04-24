package org.smartclinic.clinic.Dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.*;

import java.time.LocalDate;
@Getter
@Setter
@Data
public class AppointmentRequestDTO {

    @NotNull
    private LocalDate date;

    @NotNull
    private Long doctorId;

    @NotNull
    private Long patientId;
}

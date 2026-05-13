package org.smartclinic.clinic.Dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DoctorScheduleDto {
    private Long id;
    private Long doctorId;
    
    @NotNull
    private LocalDate scheduleDate;

    private LocalTime startTime;
    private LocalTime endTime;
}

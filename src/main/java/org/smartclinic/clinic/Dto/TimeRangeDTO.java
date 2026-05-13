package org.smartclinic.clinic.Dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class TimeRangeDTO {
    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;
}

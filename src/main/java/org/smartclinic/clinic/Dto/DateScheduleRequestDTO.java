package org.smartclinic.clinic.Dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class DateScheduleRequestDTO {
    @NotNull
    private Long doctorId;

    @NotNull
    private LocalDate scheduleDate;

    @Valid
    private List<TimeRangeDTO> timeRanges;
}

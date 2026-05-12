package org.smartclinic.clinic.Dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InsightsDTO {
    private double cancellationRate;
    private double cancellationRateChangePercent;
    private long completedToday;
    private long completedYesterday;
    private double completedTodayChangePercent;
    private long weeklyAppointments;
    private long prevWeeklyAppointments;
    private double weeklyChangePercent;
}

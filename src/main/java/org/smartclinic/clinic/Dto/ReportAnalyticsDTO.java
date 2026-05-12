package org.smartclinic.clinic.Dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReportAnalyticsDTO {
    private long totalAppointments;
    private long completed;
    private long cancelled;
    private long noShow;
    private double completionRate;
    private double cancellationRate;
    private double noShowRate;
}

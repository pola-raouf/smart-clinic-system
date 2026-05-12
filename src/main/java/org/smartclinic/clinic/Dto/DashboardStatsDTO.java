package org.smartclinic.clinic.Dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardStatsDTO {
    private long totalAppointments;
    private long totalPatients;
    private long totalDoctors;
    private long cancelledAppointments;

    private double appointmentChangePercent;
    private double patientChangePercent;
    private double doctorChangePercent;
    private double cancelledChangePercent;
}

package org.smartclinic.clinic.Dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DoctorPatientSummaryDTO {
    private PatientResponseDTO patient;
    private Integer age;
    private LocalDate lastVisitDate;
    private LocalTime lastVisitTime;
    private long appointmentCount;
}

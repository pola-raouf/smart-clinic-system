package org.smartclinic.clinic.Dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@Data
public class MedicalRecordResponseDTO {

    private Long id;
    private String chiefComplaint;
    private String symptoms;
    private String diagnosis;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDate visitDate;
    private LocalTime visitTime;

    private Long doctorId;
    private Long patientId;
    private Long appointmentId;
    private String patientName;
    private String doctorName;

    private List<PrescriptionResponseDTO> prescriptions;
}

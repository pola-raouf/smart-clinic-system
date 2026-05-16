package org.smartclinic.clinic.Dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;


@Data
@Builder
public class MedicalRecordDetailDTO {

    private Long appointmentId;
    private Long recordId;
    private String patientName;
    private String doctorName;
    private String specialty;
    private LocalDate visitDate;
    private LocalTime visitTime;
    private String chiefComplaint;
    private String symptoms;
    private String diagnosis;
    private String notes;
    private List<PrescriptionResponseDTO> prescriptions;
}

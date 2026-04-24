package org.smartclinic.clinic.Dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
@Getter
@Setter
@Data
public class MedicalRecordResponseDTO {

    private Long id;
    private String chiefComplaint;
    private String diagnosis;
    private String notes;

    private LocalDateTime createdAt;

    private Long doctorId;
    private Long patientId;
    private Long appointmentId;

}

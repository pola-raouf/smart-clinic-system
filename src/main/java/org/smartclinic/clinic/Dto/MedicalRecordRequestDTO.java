package org.smartclinic.clinic.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class MedicalRecordRequestDTO {

    @NotBlank
    private String chiefComplaint;

    private String symptoms;

    @NotBlank
    private String diagnosis;

    private String notes;

    @NotNull
    private Long doctorId;

    @NotNull
    private Long patientId;

    private Long appointmentId;
}

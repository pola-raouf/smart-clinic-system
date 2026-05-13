package org.smartclinic.clinic.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class PrescriptionRequestDTO {

    @NotBlank
    private String medicationName;
    @NotBlank
    private String dosage;
    @NotBlank
    private String frequency;
    @NotBlank
    private String duration;
    @NotNull
    private Long reportId;
}

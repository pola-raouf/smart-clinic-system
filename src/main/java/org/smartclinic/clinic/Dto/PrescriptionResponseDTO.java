package org.smartclinic.clinic.Dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class PrescriptionResponseDTO {

    private Long id;
    private String medicationName;
    private String dosage;
    private String frequency;
    private String duration;
    private Long reportId;
}

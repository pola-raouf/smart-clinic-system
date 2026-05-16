package org.smartclinic.clinic.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalHistoryResponseDTO {

    private List<MedicalRecordResponseDTO> diagnoses;
    private List<PrescriptionResponseDTO> prescriptions;
}

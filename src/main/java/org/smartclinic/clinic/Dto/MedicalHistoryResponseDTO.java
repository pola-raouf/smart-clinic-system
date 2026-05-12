package org.smartclinic.clinic.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Combined response for the "View Medical History" API.
 * Reuses the existing record/prescription DTOs — no duplication.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalHistoryResponseDTO {

    private List<MedicalRecordResponseDTO> diagnoses;
    private List<PrescriptionResponseDTO> prescriptions;
}

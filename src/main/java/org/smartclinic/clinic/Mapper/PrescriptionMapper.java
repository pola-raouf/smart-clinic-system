package org.smartclinic.clinic.Mapper;

import org.smartclinic.clinic.Entity.MedicalRecord;
import org.smartclinic.clinic.Entity.Prescription;
import org.smartclinic.clinic.Dto.*;

public class PrescriptionMapper {

    public static Prescription toEntity(PrescriptionRequestDTO dto, MedicalRecord record) {
        Prescription prescription = new Prescription();

        prescription.setMedicationName(dto.getMedicationName());
        prescription.setDosage(dto.getDosage());
        prescription.setFrequency(dto.getFrequency());
        prescription.setDuration(dto.getDuration());
        prescription.setMedicalReport(record);

        return prescription;
    }

    public static PrescriptionResponseDTO toDTO(Prescription prescription) {
        PrescriptionResponseDTO dto = new PrescriptionResponseDTO();

        dto.setId(prescription.getId());
        dto.setMedicationName(prescription.getMedicationName());
        dto.setDosage(prescription.getDosage());
        dto.setFrequency(prescription.getFrequency());
        dto.setDuration(prescription.getDuration());
        dto.setReportId(prescription.getMedicalReport().getId());

        return dto;
    }
}

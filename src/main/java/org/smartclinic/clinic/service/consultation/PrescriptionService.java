package org.smartclinic.clinic.service.consultation;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.PrescriptionRequestDTO;
import org.smartclinic.clinic.Dto.PrescriptionResponseDTO;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Entity.MedicalRecord;
import org.smartclinic.clinic.Entity.Prescription;
import org.smartclinic.clinic.Mapper.PrescriptionMapper;
import org.smartclinic.clinic.Repository.MedicalRecordRepository;
import org.smartclinic.clinic.Repository.PrescriptionRepository;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Transactional
    public PrescriptionResponseDTO addPrescription(Doctor doctor, PrescriptionRequestDTO dto) {
        MedicalRecord record = medicalRecordRepository.findById(dto.getReportId())
                .orElseThrow(() -> new ApiException("Medical record not found."));

        if (record.getDoctor() == null || !record.getDoctor().getId().equals(doctor.getId())) {
            throw new ApiException("You cannot add a prescription to another doctor's medical record.");
        }

        Prescription prescription = new PrescriptionBuilder()
                .medicationName(dto.getMedicationName())
                .dosage(dto.getDosage())
                .frequency(dto.getFrequency())
                .duration(dto.getDuration())
                .medicalReport(record)
                .build();

        return PrescriptionMapper.toDTO(prescriptionRepository.save(prescription));
    }

    
    private static final class PrescriptionBuilder {
        private final Prescription p = new Prescription();

        PrescriptionBuilder medicationName(String v) {
            p.setMedicationName(v);
            return this;
        }

        PrescriptionBuilder dosage(String v) {
            p.setDosage(v);
            return this;
        }

        PrescriptionBuilder frequency(String v) {
            p.setFrequency(v);
            return this;
        }

        PrescriptionBuilder duration(String v) {
            p.setDuration(v);
            return this;
        }

        PrescriptionBuilder medicalReport(MedicalRecord r) {
            p.setMedicalReport(r);
            return this;
        }

        Prescription build() {
            return p;
        }
    }
}

package org.smartclinic.clinic.service.consultation;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.MedicalHistoryResponseDTO;
import org.smartclinic.clinic.Dto.MedicalRecordResponseDTO;
import org.smartclinic.clinic.Dto.PrescriptionResponseDTO;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.smartclinic.clinic.Entity.MedicalRecord;
import org.smartclinic.clinic.Mapper.MedicalRecordMapper;
import org.smartclinic.clinic.Mapper.PrescriptionMapper;
import org.smartclinic.clinic.Repository.MedicalRecordRepository;
import org.smartclinic.clinic.Repository.PatientRepository;
import org.smartclinic.clinic.Repository.PrescriptionRepository;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalHistoryService {

    private final PatientRepository patientRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Transactional(readOnly = true)
    public MedicalHistoryResponseDTO getMedicalHistory(Doctor doctor, Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ApiException("Patient not found.");
        }

        List<MedicalRecord> records = medicalRecordRepository
                .findDoctorPatientVisitHistory(doctor.getId(), patientId, AppointmentStatus.COMPLETED);

        List<MedicalRecordResponseDTO> diagnoses = records.stream()
                .map(MedicalRecordMapper::toDTO)
                .collect(Collectors.toList());

        List<PrescriptionResponseDTO> prescriptions = records.stream()
                .flatMap(r -> prescriptionRepository.findByMedicalReportId(r.getId()).stream())
                .map(PrescriptionMapper::toDTO)
                .collect(Collectors.toList());

        return new MedicalHistoryResponseDTO(diagnoses, prescriptions);
    }
}

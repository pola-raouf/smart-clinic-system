package org.smartclinic.clinic.service.consultation;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.MedicalHistoryResponseDTO;
import org.smartclinic.clinic.Dto.MedicalRecordRequestDTO;
import org.smartclinic.clinic.Dto.MedicalRecordResponseDTO;
import org.smartclinic.clinic.Dto.PrescriptionRequestDTO;
import org.smartclinic.clinic.Dto.PrescriptionResponseDTO;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Entity.Role;
import org.smartclinic.clinic.Entity.User;
import org.smartclinic.clinic.Repository.DoctorRepository;
import org.smartclinic.clinic.Repository.UserRepository;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class ConsultationFacade {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    private final DiagnosisService diagnosisService;
    private final PrescriptionService prescriptionService;
    private final MedicalHistoryService medicalHistoryService;

    

    public MedicalRecordResponseDTO addDiagnosis(String doctorEmail, MedicalRecordRequestDTO dto) {
        return diagnosisService.addDiagnosis(requireDoctor(doctorEmail), dto);
    }

    public PrescriptionResponseDTO addPrescription(String doctorEmail, PrescriptionRequestDTO dto) {
        return prescriptionService.addPrescription(requireDoctor(doctorEmail), dto);
    }

    public MedicalHistoryResponseDTO getMedicalHistory(String doctorEmail, Long patientId) {
        return medicalHistoryService.getMedicalHistory(requireDoctor(doctorEmail), patientId);
    }

    
    private Doctor requireDoctor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found."));
        if (user.getRole() != Role.DOCTOR) {
            throw new ApiException("Only doctors can access this resource.");
        }
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Doctor profile not found."));
    }
}

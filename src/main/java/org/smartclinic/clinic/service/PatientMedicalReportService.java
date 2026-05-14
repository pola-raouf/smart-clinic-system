package org.smartclinic.clinic.service;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.MedicalRecordDetailDTO;
import org.smartclinic.clinic.Dto.MedicalRecordResponseDTO;
import org.smartclinic.clinic.Dto.PrescriptionResponseDTO;
import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Entity.MedicalRecord;
import org.smartclinic.clinic.Entity.Patient;
import org.smartclinic.clinic.Entity.Role;
import org.smartclinic.clinic.Entity.User;
import org.smartclinic.clinic.Mapper.MedicalRecordMapper;
import org.smartclinic.clinic.Mapper.PrescriptionMapper;
import org.smartclinic.clinic.Repository.AppointmentRepository;
import org.smartclinic.clinic.Repository.MedicalRecordRepository;
import org.smartclinic.clinic.Repository.PatientRepository;
import org.smartclinic.clinic.Repository.PrescriptionRepository;
import org.smartclinic.clinic.Repository.UserRepository;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientMedicalReportService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Transactional(readOnly = true)
    public List<MedicalRecordResponseDTO> listMyVisitReports(String email) {
        Patient patient = requirePatient(email);
        return medicalRecordRepository
                .findPatientVisitHistory(patient.getId(), AppointmentStatus.COMPLETED)
                .stream()
                .map(MedicalRecordMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicalRecordDetailDTO getRecordByAppointment(String email, Long appointmentId) {
        Patient patient = requirePatient(email);
        Appointment appt = appointmentRepository.findDetailById(appointmentId)
                .orElseThrow(() -> new ApiException("Appointment not found."));
        if (!appt.getPatient().getId().equals(patient.getId())) {
            throw new ApiException("Forbidden.");
        }
        MedicalRecord record = medicalRecordRepository
                .findFirstByAppointment_IdOrderByCreatedAtDesc(appointmentId)
                .orElseThrow(() -> new ApiException("No medical record for this appointment yet."));
        List<PrescriptionResponseDTO> rx = prescriptionRepository.findByMedicalReportId(record.getId()).stream()
                .map(PrescriptionMapper::toDTO)
                .collect(Collectors.toList());
        Doctor d = appt.getDoctor();
        return MedicalRecordDetailDTO.builder()
                .appointmentId(appt.getId())
                .recordId(record.getId())
                .patientName(appt.getPatient().getName())
                .doctorName(d != null ? d.getName() : null)
                .specialty(d != null ? d.getSpecialty() : null)
                .visitDate(appt.getDate())
                .visitTime(appt.getTime())
                .chiefComplaint(record.getChiefComplaint())
                .symptoms(record.getSymptoms())
                .diagnosis(record.getDiagnosis())
                .notes(record.getNotes())
                .prescriptions(rx)
                .build();
    }

    private Patient requirePatient(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found."));
        if (user.getRole() != Role.PATIENT) {
            throw new ApiException("Only patients can access this resource.");
        }
        return patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Patient profile not found."));
    }
}

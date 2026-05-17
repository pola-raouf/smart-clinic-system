package org.smartclinic.clinic.service.consultation;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.MedicalRecordRequestDTO;
import org.smartclinic.clinic.Dto.MedicalRecordResponseDTO;
import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Entity.MedicalRecord;
import org.smartclinic.clinic.Entity.Patient;
import org.smartclinic.clinic.Mapper.MedicalRecordMapper;
import org.smartclinic.clinic.Repository.AppointmentRepository;
import org.smartclinic.clinic.Repository.MedicalRecordRepository;
import org.smartclinic.clinic.Repository.PatientRepository;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DiagnosisService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    @Transactional
    public MedicalRecordResponseDTO addDiagnosis(Doctor doctor, MedicalRecordRequestDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ApiException("Patient not found."));

        Appointment appointment = null;
        if (dto.getAppointmentId() != null) {
            appointment = appointmentRepository.findDetailById(dto.getAppointmentId())
                    .orElseThrow(() -> new ApiException("Appointment not found."));
            if (!appointment.getDoctor().getId().equals(doctor.getId())) {
                throw new ApiException("This appointment does not belong to you.");
            }
            if (!appointment.getPatient().getId().equals(patient.getId())) {
                throw new ApiException("Patient does not match this appointment.");
            }
            if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
                throw new ApiException("Cannot save consultation for a cancelled appointment.");
            }
        }

        
        MedicalRecord saved = medicalRecordRepository.save(
                MedicalRecordMapper.toEntity(dto, doctor, patient, appointment));

        if (appointment != null && appointment.getStatus() != AppointmentStatus.COMPLETED) {
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
            patient.setVisitCount(patient.getVisitCount() + 1);
            patientRepository.save(patient);
        }

        return MedicalRecordMapper.toDTO(saved);
    }
}

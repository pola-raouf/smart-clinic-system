package org.smartclinic.clinic.service;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.AppointmentResponseDTO;
import org.smartclinic.clinic.Dto.DoctorPatientProfileAggregateDTO;
import org.smartclinic.clinic.Dto.DoctorPatientSummaryDTO;
import org.smartclinic.clinic.Dto.DoctorResponseDTO;
import org.smartclinic.clinic.Dto.DoctorScheduleDto;
import org.smartclinic.clinic.Dto.MedicalRecordResponseDTO;
import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Entity.MedicalRecord;
import org.smartclinic.clinic.Entity.Patient;
import org.smartclinic.clinic.Entity.Role;
import org.smartclinic.clinic.Entity.User;
import org.smartclinic.clinic.Mapper.AppointmentMapper;
import org.smartclinic.clinic.Mapper.DoctorMapper;
import org.smartclinic.clinic.Mapper.MedicalRecordMapper;
import org.smartclinic.clinic.Mapper.PatientMapper;
import org.smartclinic.clinic.Repository.AppointmentRepository;
import org.smartclinic.clinic.Repository.DoctorRepository;
import org.smartclinic.clinic.Repository.MedicalRecordRepository;
import org.smartclinic.clinic.Repository.PatientRepository;
import org.smartclinic.clinic.Repository.UserRepository;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorScheduleService doctorScheduleService;
    private final MedicalRecordRepository medicalRecordRepository;

    public List<DoctorResponseDTO> getAllDoctors() {
        return doctorRepository.findAllWithUser().stream()
                .map(DoctorMapper::toDTO)
                .collect(Collectors.toList());
    }

    public DoctorResponseDTO getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .map(DoctorMapper::toDTO)
                .orElseThrow(() -> new ApiException("Doctor not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<DoctorScheduleDto> getMyScheduleForDate(String email, LocalDate date) {
        Doctor doctor = requireDoctor(email);
        return doctorScheduleService.getDoctorScheduleForDate(doctor.getId(), date);
    }

    @Transactional(readOnly = true)
    public List<DoctorPatientSummaryDTO> getMyPatientSummaries(String email) {
        Doctor doctor = requireDoctor(email);
        List<Appointment> appointments = appointmentRepository.findByDoctor_IdOrderByDateAscTimeAsc(doctor.getId());
        if (appointments.isEmpty()) {
            return List.of();
        }

        Map<Long, LocalDateTime> lastVisit = new HashMap<>();
        Map<Long, Long> visitCount = new HashMap<>();
        for (Appointment a : appointments) {
            Long pid = a.getPatient().getId();
            visitCount.merge(pid, 1L, Long::sum);
            LocalDateTime at = LocalDateTime.of(a.getDate(), a.getTime());
            lastVisit.merge(pid, at, (o, n) -> n.isAfter(o) ? n : o);
        }

        List<DoctorPatientSummaryDTO> rows = new ArrayList<>();
        for (Long patientId : lastVisit.keySet()) {
            patientRepository.findById(patientId).ifPresent(patient -> {
                DoctorPatientSummaryDTO row = new DoctorPatientSummaryDTO();
                row.setPatient(PatientMapper.toDTO(patient));
                LocalDateTime lv = lastVisit.get(patientId);
                row.setLastVisitDate(lv.toLocalDate());
                row.setLastVisitTime(lv.toLocalTime());
                row.setAppointmentCount(visitCount.getOrDefault(patientId, 0L));
                if (patient.getDateOfBirth() != null) {
                    row.setAge(Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears());
                }
                rows.add(row);
            });
        }

        rows.sort(Comparator
                .comparing(DoctorPatientSummaryDTO::getLastVisitDate, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(DoctorPatientSummaryDTO::getLastVisitTime,
                        Comparator.nullsLast(Comparator.naturalOrder()))
                .reversed());
        return rows;
    }

    @Transactional(readOnly = true)
    public DoctorPatientProfileAggregateDTO getPatientProfileForDoctor(String email, Long patientId) {
        Doctor doctor = requireDoctor(email);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ApiException("Patient not found."));
        if (!appointmentRepository.existsByDoctor_IdAndPatient_Id(doctor.getId(), patientId)) {
            throw new ApiException("You do not have access to this patient.");
        }
        List<Appointment> apps = appointmentRepository.findByDoctor_IdAndPatient_IdOrderByDateAscTimeAsc(doctor.getId(),
                patientId);
        List<AppointmentResponseDTO> apptDtos = apps.stream().map(AppointmentMapper::toDTO)
                .collect(Collectors.toList());

        List<MedicalRecord> records = medicalRecordRepository
                .findByDoctor_IdAndPatient_IdOrderByCreatedAtDesc(doctor.getId(), patientId);
        List<MedicalRecordResponseDTO> recordDtos = records.stream().map(MedicalRecordMapper::toDTO)
                .collect(Collectors.toList());

        LocalDateTime now = LocalDateTime.now();
        AppointmentResponseDTO next = apps.stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED
                        && a.getStatus() != AppointmentStatus.COMPLETED)
                .filter(a -> !LocalDateTime.of(a.getDate(), a.getTime()).isBefore(now))
                .min(Comparator.comparing(Appointment::getDate).thenComparing(Appointment::getTime))
                .map(AppointmentMapper::toDTO)
                .orElse(null);

        DoctorPatientProfileAggregateDTO agg = new DoctorPatientProfileAggregateDTO();
        agg.setPatient(PatientMapper.toDTO(patient));
        agg.setAppointmentsWithDoctor(apptDtos);
        agg.setMedicalRecords(recordDtos);
        agg.setNextAppointment(next);
        return agg;
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponseDTO> getMyMedicalRecords(String email) {
        Doctor doctor = requireDoctor(email);
        return medicalRecordRepository.findByDoctor_IdOrderByCreatedAtDesc(doctor.getId()).stream()
                .map(MedicalRecordMapper::toDTO)
                .collect(Collectors.toList());
    }

    private Doctor requireDoctor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));
        if (user.getRole() != Role.DOCTOR) {
            throw new ApiException("Only doctors can access this resource.");
        }
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Doctor profile not found."));
    }
}

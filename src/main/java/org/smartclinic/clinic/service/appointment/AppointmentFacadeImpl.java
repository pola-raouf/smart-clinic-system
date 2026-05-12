package org.smartclinic.clinic.service.appointment;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.AppointmentRequestDTO;
import org.smartclinic.clinic.Dto.AppointmentResponseDTO;
import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.smartclinic.clinic.Entity.Doctor;
import org.smartclinic.clinic.Entity.Patient;
import org.smartclinic.clinic.Mapper.AppointmentMapper;
import org.smartclinic.clinic.Repository.AppointmentRepository;
import org.smartclinic.clinic.Repository.DoctorRepository;
import org.smartclinic.clinic.Repository.DoctorScheduleRepository;
import org.smartclinic.clinic.Repository.PatientRepository;
import org.smartclinic.clinic.exception.ApiException;
import org.smartclinic.clinic.service.appointment.state.AppointmentStateResolver;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Facade Pattern implementation – orchestrates all appointment operations.
 *
 * Responsibilities:
 *  - Validate inputs (doctor/patient existence, dates, double-booking)
 *  - Delegate status transitions to the State Pattern via AppointmentStateResolver
 *  - Use AppointmentMapper for entity↔DTO conversion
 *  - Persist via AppointmentRepository
 *
 * The controller calls ONLY this class. No business logic lives in the controller.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentFacadeImpl implements AppointmentFacade {

    private static final int SLOT_MINUTES = 30;

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository       doctorRepository;
    private final PatientRepository      patientRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final AppointmentStateResolver resolver;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    // ─────────────────────────────────────────────────────────────────────────
    // BOOK
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public AppointmentResponseDTO bookAppointment(AppointmentRequestDTO request) {

        LocalDate date = request.getDate();
        LocalTime time = request.getTime();

        // 1. Doctor must exist
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ApiException("Doctor not found with id: " + request.getDoctorId()));

        // 2. Patient must exist
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ApiException("Patient not found with id: " + request.getPatientId()));

        // 3. Date must not be in the past
        if (date.isBefore(LocalDate.now())) {
            throw new ApiException("Cannot book an appointment in the past.");
        }

        // 4. Same-day: time must not be in the past
        if (date.equals(LocalDate.now()) && time.isBefore(LocalTime.now())) {
            throw new ApiException("Cannot book a past time slot for today.");
        }

        // 4.5 Time slot alignment validation (seconds and 30-min intervals)
        if (time.getMinute() % SLOT_MINUTES != 0 || time.getSecond() != 0) {
            throw new ApiException("Invalid time slot");
        }

        // 4.6 Validate against dynamic schedule
        List<org.smartclinic.clinic.Entity.DoctorSchedule> schedules =
            scheduleRepository.findByDoctor_IdAndScheduleDate(doctor.getId(), date);
        
        if (schedules.isEmpty()) {
            throw new ApiException("Doctor is not available on this day.");
        }
        
        boolean timeIsValid = false;
        for (org.smartclinic.clinic.Entity.DoctorSchedule schedule : schedules) {
            if (!time.isBefore(schedule.getStartTime()) && time.isBefore(schedule.getEndTime())) {
                timeIsValid = true;
                break;
            }
        }

        if (!timeIsValid) {
            throw new ApiException("Requested time is outside doctor's working hours.");
        }

        // 5. Double-booking check — blocks only BOOKED or CONFIRMED slots
        boolean slotTaken = appointmentRepository.existsByDoctor_IdAndDateAndTimeAndStatusIn(
                doctor.getId(), date, time, List.of(AppointmentStatus.BOOKED, AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED));
        if (slotTaken) {
            throw new ApiException("This time slot is already booked for the selected doctor.");
        }

        // 6. Reuse cancelled slot (same doctor/date/time) to avoid unique-key conflict
        //    and allow rebooking cancelled appointments.
        Appointment appointment = appointmentRepository
                .findTopByDoctor_IdAndDateAndTimeAndStatusOrderByIdDesc(
                        doctor.getId(), date, time, AppointmentStatus.CANCELLED)
                .orElseGet(() -> AppointmentMapper.toEntity(date, time, doctor, patient));

        // Ensure rebooked cancelled slots are reassigned to the new patient and active state.
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setDate(date);
        appointment.setTime(time);
        appointment.setStatus(AppointmentStatus.BOOKED);

        // 7. Persist and return DTO
        Appointment saved = appointmentRepository.save(appointment);
        eventPublisher.publishEvent(new org.smartclinic.clinic.event.AppointmentEvent(saved, org.smartclinic.clinic.event.AppointmentEvent.EventType.BOOKED));
        return AppointmentMapper.toDTO(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONFIRM
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public AppointmentResponseDTO confirmAppointment(Long id) {
        Appointment appointment = findOrThrow(id);
        resolver.resolve(appointment.getStatus()).confirm(appointment);
        Appointment saved = appointmentRepository.save(appointment);
        eventPublisher.publishEvent(new org.smartclinic.clinic.event.AppointmentEvent(saved, org.smartclinic.clinic.event.AppointmentEvent.EventType.CONFIRMED));
        return AppointmentMapper.toDTO(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CANCEL
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public AppointmentResponseDTO cancelAppointment(Long id) {
        Appointment appointment = findOrThrow(id);
        resolver.resolve(appointment.getStatus()).cancel(appointment);
        Appointment saved = appointmentRepository.save(appointment);
        eventPublisher.publishEvent(new org.smartclinic.clinic.event.AppointmentEvent(saved, org.smartclinic.clinic.event.AppointmentEvent.EventType.CANCELLED));
        return AppointmentMapper.toDTO(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMPLETE
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public AppointmentResponseDTO completeAppointment(Long id) {
        Appointment appointment = findOrThrow(id);
        resolver.resolve(appointment.getStatus()).complete(appointment);
        return AppointmentMapper.toDTO(appointmentRepository.save(appointment));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY – doctor appointments
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getDoctorAppointments(Long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ApiException("Doctor not found with id: " + doctorId);
        }
        return appointmentRepository.findByDoctor_IdOrderByDateAscTimeAsc(doctorId)
                .stream()
                .map(AppointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY – patient appointments
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getPatientAppointments(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ApiException("Patient not found with id: " + patientId);
        }
        return appointmentRepository.findByPatient_IdOrderByDateAscTimeAsc(patientId)
                .stream()
                .map(AppointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // QUERY – doctor availability
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<LocalTime> getDoctorAvailability(Long doctorId, LocalDate date) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ApiException("Doctor not found with id: " + doctorId);
        }

        // Fetch dynamic schedule
        List<org.smartclinic.clinic.Entity.DoctorSchedule> schedules =
            scheduleRepository.findByDoctor_IdAndScheduleDate(doctorId, date);

        if (schedules.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        // Fetch only BOOKED or CONFIRMED appointments — CANCELLED/COMPLETED free up the slot
        List<LocalTime> bookedTimes = appointmentRepository
                .findByDoctor_IdAndDateAndStatusIn(
                        doctorId, date,
                        List.of(AppointmentStatus.BOOKED, AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED))
                .stream()
                .map(Appointment::getTime)
                .collect(Collectors.toList());

        List<LocalTime> availableSlots = new java.util.ArrayList<>();
        
        for (org.smartclinic.clinic.Entity.DoctorSchedule schedule : schedules) {
            LocalTime startTime = schedule.getStartTime();
            LocalTime endTime = schedule.getEndTime();
            LocalTime slot = startTime;
            while (slot.isBefore(endTime)) {
                if (!bookedTimes.contains(slot) && !availableSlots.contains(slot)) {
                    availableSlots.add(slot);
                }
                slot = slot.plusMinutes(SLOT_MINUTES);
            }
        }
        
        // Sort the slots just in case the ranges were overlapping or out of order
        java.util.Collections.sort(availableSlots);

        return availableSlots;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private Appointment findOrThrow(Long id) {
        return appointmentRepository.findDetailById(id)
                .orElseThrow(() -> new ApiException("Appointment not found with id: " + id));
    }
}

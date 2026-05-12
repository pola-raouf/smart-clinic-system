package org.smartclinic.clinic.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Dto.AppointmentRequestDTO;
import org.smartclinic.clinic.Dto.AppointmentResponseDTO;
import org.smartclinic.clinic.service.appointment.AppointmentFacade;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Appointment Controller – all endpoints under /api/appointments.
 *
 * This controller calls ONLY the AppointmentFacade.
 * No repository, mapper, or state class is referenced here.
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentFacade appointmentFacade;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/appointments  →  Book appointment
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<AppointmentResponseDTO> bookAppointment(
            @Valid @RequestBody AppointmentRequestDTO request) {
        return ResponseEntity.ok(appointmentFacade.bookAppointment(request));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /api/appointments/{id}/confirm  →  BOOKED → CONFIRMED
    // ─────────────────────────────────────────────────────────────────────────
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<AppointmentResponseDTO> confirmAppointment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(appointmentFacade.confirmAppointment(id));
        } catch (Exception e) {
            try {
                java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter("err.txt", true));
                pw.println("CONFIRM ERROR:");
                e.printStackTrace(pw);
                pw.close();
            } catch (Exception ex) {}
            throw new org.smartclinic.clinic.exception.ApiException("CONFIRM ERROR: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /api/appointments/{id}/cancel  →  BOOKED/CONFIRMED → CANCELLED
    // ─────────────────────────────────────────────────────────────────────────
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AppointmentResponseDTO> cancelAppointment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(appointmentFacade.cancelAppointment(id));
        } catch (Exception e) {
            throw new org.smartclinic.clinic.exception.ApiException("CANCEL ERROR: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /api/appointments/{id}/complete  →  CONFIRMED → COMPLETED
    // ─────────────────────────────────────────────────────────────────────────
    @PatchMapping("/{id}/complete")
    public ResponseEntity<AppointmentResponseDTO> completeAppointment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(appointmentFacade.completeAppointment(id));
        } catch (Exception e) {
            throw new org.smartclinic.clinic.exception.ApiException("COMPLETE ERROR: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/appointments/doctor/{doctorId}  →  All appointments for a doctor
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getDoctorAppointments(
            @PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentFacade.getDoctorAppointments(doctorId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/appointments/patient/{patientId}  →  All appointments for a patient
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponseDTO>> getPatientAppointments(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentFacade.getPatientAppointments(patientId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/appointments/doctor/{doctorId}/availability?date=YYYY-MM-DD
    //   →  Available time slots (excludes BOOKED + CONFIRMED only)
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/doctor/{doctorId}/availability")
    public ResponseEntity<List<LocalTime>> getDoctorAvailability(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentFacade.getDoctorAvailability(doctorId, date));
    }
}

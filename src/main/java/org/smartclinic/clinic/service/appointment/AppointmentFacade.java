package org.smartclinic.clinic.service.appointment;

import org.smartclinic.clinic.Dto.AppointmentRequestDTO;
import org.smartclinic.clinic.Dto.AppointmentResponseDTO;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Facade Pattern – single entry point for all appointment operations.
 * Controllers must call ONLY this interface. No direct access to
 * repository, mapper, or state classes from the controller layer.
 */
public interface AppointmentFacade {

    AppointmentResponseDTO bookAppointment(AppointmentRequestDTO request);

    AppointmentResponseDTO confirmAppointment(Long id);

    AppointmentResponseDTO cancelAppointment(Long id);

    AppointmentResponseDTO completeAppointment(Long id);

    List<AppointmentResponseDTO> getDoctorAppointments(Long doctorId);

    List<AppointmentResponseDTO> getPatientAppointments(Long patientId);

    List<LocalTime> getDoctorAvailability(Long doctorId, LocalDate date);
}

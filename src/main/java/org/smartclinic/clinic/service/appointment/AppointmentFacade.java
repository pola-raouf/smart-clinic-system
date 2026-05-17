package org.smartclinic.clinic.service.appointment;

import org.smartclinic.clinic.Dto.AppointmentRequestDTO;
import org.smartclinic.clinic.Dto.AppointmentResponseDTO;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;


public interface AppointmentFacade {

    AppointmentResponseDTO bookAppointment(AppointmentRequestDTO request);

    AppointmentResponseDTO confirmAppointment(Long id);

    AppointmentResponseDTO cancelAppointment(Long id);

    AppointmentResponseDTO completeAppointment(Long id);

    List<AppointmentResponseDTO> getDoctorAppointments(Long doctorId);

    List<AppointmentResponseDTO> getPatientAppointments(Long patientId);

    List<LocalTime> getDoctorAvailability(Long doctorId, LocalDate date);
}

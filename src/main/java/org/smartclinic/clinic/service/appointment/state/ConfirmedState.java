package org.smartclinic.clinic.service.appointment.state;

import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.stereotype.Component;

/**
 * State Pattern – CONFIRMED state.
 * Allowed transitions: CONFIRMED → COMPLETED, CONFIRMED → CANCELLED
 */
@Component
public class ConfirmedState implements AppointmentState {

    @Override
    public void confirm(Appointment appointment) {
        throw new ApiException("Appointment is already CONFIRMED.");
    }

    @Override
    public void cancel(Appointment appointment) {
        appointment.setStatus(AppointmentStatus.CANCELLED);
    }

    @Override
    public void complete(Appointment appointment) {
        appointment.setStatus(AppointmentStatus.COMPLETED);
    }
}

package org.smartclinic.clinic.service.appointment.state;

import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.stereotype.Component;


@Component
public class BookedState implements AppointmentState {

    @Override
    public void confirm(Appointment appointment) {
        appointment.setStatus(AppointmentStatus.CONFIRMED);
    }

    @Override
    public void cancel(Appointment appointment) {
        appointment.setStatus(AppointmentStatus.CANCELLED);
    }

    @Override
    public void complete(Appointment appointment) {
        throw new ApiException("Cannot complete a BOOKED appointment. It must be CONFIRMED first.");
    }
}

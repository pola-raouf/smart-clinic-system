package org.smartclinic.clinic.service.appointment.state;

import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.exception.ApiException;
import org.springframework.stereotype.Component;


@Component
public class CompletedState implements AppointmentState {

    @Override
    public void confirm(Appointment appointment) {
        throw new ApiException("Cannot confirm a COMPLETED appointment.");
    }

    @Override
    public void cancel(Appointment appointment) {
        throw new ApiException("Cannot cancel a COMPLETED appointment.");
    }

    @Override
    public void complete(Appointment appointment) {
        throw new ApiException("Appointment is already COMPLETED.");
    }
}

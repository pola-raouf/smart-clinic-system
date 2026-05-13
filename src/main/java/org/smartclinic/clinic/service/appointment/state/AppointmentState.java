package org.smartclinic.clinic.service.appointment.state;

import org.smartclinic.clinic.Entity.Appointment;

/**
 * State Pattern – defines the contract for all appointment state transitions.
 * Each concrete state allows or blocks confirm/cancel/complete transitions.
 */
public interface AppointmentState {

    void confirm(Appointment appointment);

    void cancel(Appointment appointment);

    void complete(Appointment appointment);
}

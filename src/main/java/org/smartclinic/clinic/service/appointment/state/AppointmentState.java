package org.smartclinic.clinic.service.appointment.state;

import org.smartclinic.clinic.Entity.Appointment;


public interface AppointmentState {

    void confirm(Appointment appointment);

    void cancel(Appointment appointment);

    void complete(Appointment appointment);
}

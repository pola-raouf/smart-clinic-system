package org.smartclinic.clinic.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.smartclinic.clinic.Entity.Appointment;

@Getter
@AllArgsConstructor
public class AppointmentEvent {
    private final Appointment appointment;
    private final EventType type;

    public enum EventType {
        BOOKED,
        CONFIRMED,
        CANCELLED,
        RESCHEDULED
    }
}

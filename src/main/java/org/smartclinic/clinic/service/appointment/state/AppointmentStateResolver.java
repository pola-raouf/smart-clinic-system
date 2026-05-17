package org.smartclinic.clinic.service.appointment.state;

import lombok.RequiredArgsConstructor;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class AppointmentStateResolver {

    private final BookedState bookedState;
    private final ConfirmedState confirmedState;
    private final CancelledState cancelledState;
    private final CompletedState completedState;

    public AppointmentState resolve(AppointmentStatus status) {
        if (status == null) {
            throw new org.smartclinic.clinic.exception.ApiException("Appointment has invalid status.");
        }
        return switch (status) {
            case BOOKED    -> bookedState;
            case PENDING   -> bookedState;
            case CONFIRMED -> confirmedState;
            case CANCELLED -> cancelledState;
            case COMPLETED -> completedState;
        };
    }
}

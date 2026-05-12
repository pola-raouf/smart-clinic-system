package org.smartclinic.clinic.Entity;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "appointments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"doctor_id", "date", "time"})
})
@AllArgsConstructor
@NoArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalTime time;

    private LocalDate date;
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status; // status hena hatkon eh

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
}

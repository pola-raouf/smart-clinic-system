package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctorIdAndDate(Long doctorId, LocalDate date);//nageb maw3ed doctor fe youm mo3yan
    List<Appointment> findByPatientId(Long patientId);//nageb history bta3 patient mo3yan
    List<Appointment> findByStatus(AppointmentStatus status);//maw3ed doctor mo3yan 7asab booked wala complete wala cancel
}

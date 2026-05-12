package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.smartclinic.clinic.Entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatient_IdOrderByCreatedAtDesc(Long patientId);

    List<MedicalRecord> findByDoctor_IdOrderByCreatedAtDesc(Long doctorId);

    List<MedicalRecord> findByDoctor_IdAndPatient_IdOrderByCreatedAtDesc(Long doctorId, Long patientId);

    @Query("""
            SELECT m FROM MedicalRecord m
            WHERE m.doctor.id = :doctorId AND m.patient.id = :patientId
            AND (m.appointment IS NULL OR m.appointment.status = :completed)
            ORDER BY m.createdAt DESC
            """)
    List<MedicalRecord> findDoctorPatientVisitHistory(
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("completed") AppointmentStatus completed);

    @Query("""
            SELECT m FROM MedicalRecord m
            WHERE m.patient.id = :patientId
            AND (m.appointment IS NULL OR m.appointment.status = :completed)
            ORDER BY m.createdAt DESC
            """)
    List<MedicalRecord> findPatientVisitHistory(
            @Param("patientId") Long patientId,
            @Param("completed") AppointmentStatus completed);

    Optional<MedicalRecord> findFirstByAppointment_IdOrderByCreatedAtDesc(Long appointmentId);
}

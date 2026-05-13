package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.Appointment;
import org.smartclinic.clinic.Entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("SELECT DISTINCT a FROM Appointment a JOIN FETCH a.doctor JOIN FETCH a.patient WHERE a.id = :id")
    Optional<Appointment> findDetailById(@Param("id") Long id);

    List<Appointment> findByDoctorIdAndDate(Long doctorId, LocalDate date);
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByStatus(AppointmentStatus status);
    List<Appointment> findByDateAndStatusIn(LocalDate date, List<AppointmentStatus> statuses);

    boolean existsByDoctor_IdAndDateAndTimeAndStatusIn(
            Long doctorId,
            LocalDate date,
            LocalTime time,
            List<AppointmentStatus> statuses
    );

    Optional<Appointment> findTopByDoctor_IdAndDateAndTimeAndStatusOrderByIdDesc(
            Long doctorId,
            LocalDate date,
            LocalTime time,
            AppointmentStatus status
    );

    List<Appointment> findByDoctor_IdOrderByDateAscTimeAsc(Long doctorId);

    List<Appointment> findByPatient_IdOrderByDateAscTimeAsc(Long patientId);

    List<Appointment> findByDoctor_IdAndDateAndStatusIn(
            Long doctorId,
            LocalDate date,
            List<AppointmentStatus> statuses
    );

    boolean existsByDoctor_IdAndPatient_Id(Long doctorId, Long patientId);

    List<Appointment> findByDoctor_IdAndPatient_IdOrderByDateAscTimeAsc(Long doctorId, Long patientId);

    long countByStatus(AppointmentStatus status);

    long countByDateBetween(LocalDate from, LocalDate to);

    long countByStatusAndDateBetween(AppointmentStatus status, LocalDate from, LocalDate to);

    long countByStatusAndDate(AppointmentStatus status, LocalDate date);

    @Query("SELECT a.date, COUNT(a) FROM Appointment a WHERE a.date BETWEEN :from AND :to GROUP BY a.date ORDER BY a.date ASC")
    List<Object[]> countGroupedByDate(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT FUNCTION('YEARWEEK', a.date, 1), COUNT(a) FROM Appointment a WHERE a.date BETWEEN :from AND :to GROUP BY FUNCTION('YEARWEEK', a.date, 1) ORDER BY FUNCTION('YEARWEEK', a.date, 1) ASC")
    List<Object[]> countGroupedByWeek(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT FUNCTION('YEAR', a.date), FUNCTION('MONTH', a.date), COUNT(a) FROM Appointment a WHERE a.date BETWEEN :from AND :to GROUP BY FUNCTION('YEAR', a.date), FUNCTION('MONTH', a.date) ORDER BY FUNCTION('YEAR', a.date) ASC, FUNCTION('MONTH', a.date) ASC")
    List<Object[]> countGroupedByMonth(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.date BETWEEN :from AND :to AND (:doctorId IS NULL OR a.doctor.id = :doctorId)")
    long countByDateRangeAndDoctor(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("doctorId") Long doctorId);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status AND a.date BETWEEN :from AND :to AND (:doctorId IS NULL OR a.doctor.id = :doctorId)")
    long countByStatusAndDateRangeAndDoctor(@Param("status") AppointmentStatus status, @Param("from") LocalDate from, @Param("to") LocalDate to, @Param("doctorId") Long doctorId);

    @Query("SELECT a.date, a.status, COUNT(a) FROM Appointment a WHERE a.date BETWEEN :from AND :to AND (:doctorId IS NULL OR a.doctor.id = :doctorId) GROUP BY a.date, a.status ORDER BY a.date ASC")
    List<Object[]> countByDateAndStatusGrouped(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("doctorId") Long doctorId);

    @Query("SELECT a.date, COUNT(a) FROM Appointment a WHERE a.date BETWEEN :from AND :to AND (:doctorId IS NULL OR a.doctor.id = :doctorId) GROUP BY a.date ORDER BY a.date ASC")
    List<Object[]> countGroupedByDateFiltered(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("doctorId") Long doctorId);
}

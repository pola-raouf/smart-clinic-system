package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    List<DoctorSchedule> findByDoctor_Id(Long doctorId);
    List<DoctorSchedule> findByDoctor_IdAndScheduleDate(Long doctorId, LocalDate scheduleDate);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM DoctorSchedule ds WHERE ds.doctor.id = :doctorId")
    void deleteByDoctor_Id(@Param("doctorId") Long doctorId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM DoctorSchedule ds WHERE ds.doctor.id = :doctorId AND ds.scheduleDate = :date")
    void deleteByDoctor_IdAndScheduleDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
}

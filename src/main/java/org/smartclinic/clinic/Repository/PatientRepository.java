package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    @Query("SELECT DISTINCT p FROM Patient p LEFT JOIN FETCH p.user ORDER BY p.id")
    List<Patient> findAllWithUsers();
    Optional<Patient> findByUserId(Long userId);// tageb info bt3t patient mn userid
    List<Patient> findByNameContainingIgnoreCase(String name);//search bal asm
    Optional<Patient> findByPhoneNumber(String phoneNumber);//nageb al mared b rakm al telephone
}

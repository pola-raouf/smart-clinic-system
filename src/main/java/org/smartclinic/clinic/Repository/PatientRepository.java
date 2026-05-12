package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    @Query("SELECT DISTINCT p FROM Patient p LEFT JOIN FETCH p.user ORDER BY p.id")
    List<Patient> findAllWithUsers();
    Optional<Patient> findByUserId(Long userId);
    List<Patient> findByNameContainingIgnoreCase(String name);
    Optional<Patient> findByPhoneNumber(String phoneNumber);

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.id BETWEEN :fromId AND :toId")
    long countApproxInRange(@Param("fromId") Long fromId, @Param("toId") Long toId);
}

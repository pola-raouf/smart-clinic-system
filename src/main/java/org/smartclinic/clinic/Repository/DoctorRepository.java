package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.Doctor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(Long userId);//nageb doctor mn id
    List<Doctor> findBySpecialty(String specialty);//nageb doctor b ta5sos mo3yan

    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT d FROM Doctor d")
    List<Doctor> findAllWithUser();
}

package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(Long userId);//nageb doctor mn id
    List<Doctor> findBySpecialty(String specialty);//nageb doctor b ta5sos mo3yan
}

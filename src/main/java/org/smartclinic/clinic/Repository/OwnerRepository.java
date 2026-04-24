package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OwnerRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByUserId(Long userId);// nageb owner mn id
}

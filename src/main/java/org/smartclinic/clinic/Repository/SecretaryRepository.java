package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.Secretary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SecretaryRepository extends JpaRepository<Secretary, Long> {
    Optional<Secretary> findByUserId(Long userId);//nageb secretary mn id
}

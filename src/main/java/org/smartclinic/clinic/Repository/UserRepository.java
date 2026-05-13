package org.smartclinic.clinic.Repository;

import org.smartclinic.clinic.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // batwar 3ala user bal email
}

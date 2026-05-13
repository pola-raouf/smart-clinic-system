package org.smartclinic.clinic.Dto;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;
import org.smartclinic.clinic.Entity.Gender;

import java.time.LocalDate;

@Getter
@Setter
public class RegisterRequestDTO {

    private String email;
    private String password;

    private String name;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    private String phoneNumber;
    private String address;
    private LocalDate dateOfBirth;
}
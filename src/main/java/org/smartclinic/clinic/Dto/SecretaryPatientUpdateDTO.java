package org.smartclinic.clinic.Dto;

import lombok.Getter;
import lombok.Setter;
import org.smartclinic.clinic.Entity.Gender;

import java.time.LocalDate;

@Getter
@Setter
public class SecretaryPatientUpdateDTO {
    private String name;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String address;
    private String email;
    private String password;
}

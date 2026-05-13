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
    /** Optional: change login email */
    private String email;
    /** Optional: set new password (plain text, will be encoded) */
    private String password;
}

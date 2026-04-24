package org.smartclinic.clinic.Dto;

import lombok.Getter;
import lombok.Setter;
import org.smartclinic.clinic.Entity.Gender;
import org.smartclinic.clinic.Entity.Role;

import java.time.LocalDate;

@Getter
@Setter
public class AdminUserCreateDTO {
    private String email;
    private String password;
    private Role role;
    private String name;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String address;
    private String specialty;
}

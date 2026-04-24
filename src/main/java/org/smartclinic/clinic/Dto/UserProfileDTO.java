package org.smartclinic.clinic.Dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserProfileDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String address;
    private String specialty;
}

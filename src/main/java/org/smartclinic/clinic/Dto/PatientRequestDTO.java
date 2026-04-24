package org.smartclinic.clinic.Dto;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.smartclinic.clinic.Entity.Gender;

import java.time.LocalDate;

@Getter
@Setter
@Data
public class PatientRequestDTO {
    @NotBlank
    private String name;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String address;
    private UserRequestDTO user;
}
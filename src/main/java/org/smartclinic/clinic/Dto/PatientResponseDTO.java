package org.smartclinic.clinic.Dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientResponseDTO {
    private Long id;
    private String name;
    private String gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String address;
    private Long userId;

    private String email; 

    private int visitCount;
}

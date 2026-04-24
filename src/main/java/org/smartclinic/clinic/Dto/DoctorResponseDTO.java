package org.smartclinic.clinic.Dto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DoctorResponseDTO {
    private Long id;
    private String name;
    private String specialty;
    private Long userId;
}

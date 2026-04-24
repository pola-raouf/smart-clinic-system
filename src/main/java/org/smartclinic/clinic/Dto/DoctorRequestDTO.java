package org.smartclinic.clinic.Dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class DoctorRequestDTO {
    @NotBlank
    private String name;
    @NotBlank
    private String specialty;
    private UserRequestDTO user;
}

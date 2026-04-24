package org.smartclinic.clinic.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class OwnerRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;
    private UserRequestDTO user;
}

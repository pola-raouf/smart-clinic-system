package org.smartclinic.clinic.Dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.smartclinic.clinic.Entity.Role;

@Getter
@Setter
public class UserRequestDTO {


    private String password;

    private String email;
}

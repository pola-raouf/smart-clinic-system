package org.smartclinic.clinic.Dto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.smartclinic.clinic.Entity.Role;
@Getter
@Setter
@Data
public class UserResponseDTO {
    private Long id;
    private String email;
    private Role role;
}




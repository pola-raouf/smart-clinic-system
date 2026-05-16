package org.smartclinic.clinic.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserUpdateDTO {
    private String email;
    
    private String password;
   
    private String name;
}

package org.smartclinic.clinic.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserUpdateDTO {
    private String email;
    /** Plain password; if null or blank, password is unchanged */
    private String password;
    /** Updates profile display name when applicable */
    private String name;
}

package org.smartclinic.clinic.Dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class SecretaryResponseDTO {

    private Long id;
    private String name;
    private Long userId;
}

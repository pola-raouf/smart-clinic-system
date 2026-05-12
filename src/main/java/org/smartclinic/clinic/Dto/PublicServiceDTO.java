package org.smartclinic.clinic.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicServiceDTO {
    private String title;
    private String iconKey;
    private String description;
    private String filterSlug;
}

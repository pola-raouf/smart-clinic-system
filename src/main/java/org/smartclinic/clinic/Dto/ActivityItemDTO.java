package org.smartclinic.clinic.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ActivityItemDTO {
    private String type;
    private String description;
    private String actor;
    private String timestamp;
    private String iconColor;
}

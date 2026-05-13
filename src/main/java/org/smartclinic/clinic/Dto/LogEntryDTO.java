package org.smartclinic.clinic.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LogEntryDTO {
    private String timestamp;
    private String level;
    private String message;
}

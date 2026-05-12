package org.smartclinic.clinic.Dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SystemLogEntryDTO {
    private String timestamp;
    private String level;
    private String eventType;
    private String user;
    private String role;
    private String action;
    private String module;
    private String status;
    private String message;
}

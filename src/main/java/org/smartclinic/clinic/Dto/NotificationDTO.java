package org.smartclinic.clinic.Dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private String timestamp;
    private boolean isRead;
    private Long relatedAppointmentId;
}

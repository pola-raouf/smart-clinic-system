package org.smartclinic.clinic.Dto;

import lombok.Builder;
import lombok.Data;

/**
 * Full user + role-specific profile fields for owner console (password hash is never exposed).
 */
@Data
@Builder
public class AdminUserDetailDTO {
    private Long userId;
    private String email;
    private String role;

    private Long patientRecordId;
    private String patientName;
    private String gender;
    private String dateOfBirth;
    private String phoneNumber;
    private String address;

    private Long doctorRecordId;
    private String doctorName;
    private String specialty;

    private Long secretaryRecordId;
    private String secretaryName;

    private Long ownerRecordId;
    private String ownerName;
}

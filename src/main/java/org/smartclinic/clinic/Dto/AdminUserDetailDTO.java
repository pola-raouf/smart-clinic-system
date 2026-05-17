package org.smartclinic.clinic.Dto;

import lombok.Builder;
import lombok.Data;

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

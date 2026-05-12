package org.smartclinic.clinic.Dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserProfileDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String address;
    private String specialty;
    /** Path or URL to profile photo */
    private String profileImageUrl;

    /** Set for patients only: completed-visit counter from {@code Patient.visitCount}. */
    private Integer visitCount;
}

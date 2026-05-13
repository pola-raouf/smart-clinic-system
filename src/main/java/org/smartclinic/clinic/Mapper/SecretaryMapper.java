package org.smartclinic.clinic.Mapper;

import org.smartclinic.clinic.Entity.Secretary;
import org.smartclinic.clinic.Dto.SecretaryRequestDTO;
import org.smartclinic.clinic.Dto.SecretaryResponseDTO;
import org.smartclinic.clinic.Entity.User;

public class SecretaryMapper {

    public static Secretary toEntity(SecretaryRequestDTO dto, User user) {
        Secretary s = new Secretary();
        s.setName(dto.getName());
        s.setUser(user);
        return s;
    }

    public static SecretaryResponseDTO toDTO(Secretary s) {
        SecretaryResponseDTO dto = new SecretaryResponseDTO();
        dto.setId(s.getId());
        dto.setName(s.getName());

        if (s.getUser() != null) {
            dto.setUserId(s.getUser().getId());
        }

        return dto;
    }
}
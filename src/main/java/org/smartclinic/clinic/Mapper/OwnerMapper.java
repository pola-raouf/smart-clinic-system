package org.smartclinic.clinic.Mapper;

import org.smartclinic.clinic.Entity.Owner;
import org.smartclinic.clinic.Dto.OwnerRequestDTO;
import org.smartclinic.clinic.Dto.OwnerResponseDTO;
import org.smartclinic.clinic.Entity.User;

public class OwnerMapper {

    public static Owner toEntity(OwnerRequestDTO dto, User user) {
        Owner owner = new Owner();
        owner.setName(dto.getName());
        owner.setUser(user);
        return owner;
    }

    public static OwnerResponseDTO toDTO(Owner owner) {
        OwnerResponseDTO dto = new OwnerResponseDTO();
        dto.setId(owner.getId());
        dto.setName(owner.getName());

        if (owner.getUser() != null) {
            dto.setUserId(owner.getUser().getId());
        }

        return dto;
    }
}

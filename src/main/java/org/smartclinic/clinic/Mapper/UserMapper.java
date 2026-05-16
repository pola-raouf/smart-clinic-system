package org.smartclinic.clinic.Mapper;

import org.smartclinic.clinic.Entity.User;
import org.smartclinic.clinic.Dto.UserRequestDTO;
import org.smartclinic.clinic.Dto.UserResponseDTO;
import org.smartclinic.clinic.Dto.RegisterRequestDTO;
import org.smartclinic.clinic.Entity.Role;

public class UserMapper {

    public static User toEntity(UserRequestDTO dto, Role role) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setRole(role);
        return user;
    }

    public static User toEntity(RegisterRequestDTO dto, Role role) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setRole(role);
        return user;
    }

    public static UserResponseDTO toDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }
}

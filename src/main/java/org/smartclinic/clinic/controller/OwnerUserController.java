package org.smartclinic.clinic.controller;

import org.smartclinic.clinic.Dto.AdminUserCreateDTO;
import org.smartclinic.clinic.Dto.AdminUserDetailDTO;
import org.smartclinic.clinic.Dto.AdminUserUpdateDTO;
import org.smartclinic.clinic.service.OwnerUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/users")
public class OwnerUserController {

    @Autowired
    private OwnerUserService ownerUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserDetailDTO>> list() {
        return ResponseEntity.ok(ownerUserService.listUsers());
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody AdminUserCreateDTO dto) {
        ownerUserService.createUser(dto);
        return ResponseEntity.ok("User created successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> update(
            @PathVariable Long id,
            @RequestBody AdminUserUpdateDTO dto) {
        ownerUserService.updateUser(id, dto);
        return ResponseEntity.ok("User updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        ownerUserService.deleteUser(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}

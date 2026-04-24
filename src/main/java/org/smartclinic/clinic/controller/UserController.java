package org.smartclinic.clinic.controller;

import org.smartclinic.clinic.Dto.UserProfileDTO;
import org.smartclinic.clinic.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> me(Authentication authentication) {
        return ResponseEntity.ok(userProfileService.getProfile(authentication.getName()));
    }
}

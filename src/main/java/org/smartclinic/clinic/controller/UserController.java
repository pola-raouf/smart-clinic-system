package org.smartclinic.clinic.controller;

import org.smartclinic.clinic.Dto.UserProfileDTO;
import org.smartclinic.clinic.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> me(Authentication authentication) {
        return ResponseEntity.ok(userProfileService.getProfile(authentication.getName()));
    }

    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileDTO> uploadPhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userProfileService.updateProfilePhoto(authentication.getName(), file));
    }

    @DeleteMapping("/me/photo")
    public ResponseEntity<UserProfileDTO> deletePhoto(Authentication authentication) {
        return ResponseEntity.ok(userProfileService.deleteProfilePhoto(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestBody UserProfileDTO dto) {
        try {
            return ResponseEntity.ok(userProfileService.updateProfile(authentication.getName(), dto));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("message", e.getClass().getName() + ": " + e.getMessage()));
        }
    }
}

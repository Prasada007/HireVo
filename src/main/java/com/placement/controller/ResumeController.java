package com.placement.controller;

import com.placement.dto.ApiResponse;
import com.placement.model.StudentProfile;
import com.placement.service.StudentProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/students")
public class ResumeController {

    @Autowired
    private StudentProfileService profileService;

    @Autowired
    private com.placement.repository.StudentRepo studentRepo;

    // Upload resume
    @PostMapping("/{studentId}/resume")
    public ResponseEntity<ApiResponse> uploadResume(
            @PathVariable Integer studentId,
            @RequestParam("file") MultipartFile file,
            org.springframework.security.core.Authentication authentication) {

        if (!isAuthorizedStudentOrAdmin(studentId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: You cannot upload resumes for other students", null));
        }

        StudentProfile profile = profileService.uploadResume(studentId, file);
        return ResponseEntity.ok(new ApiResponse(
                true,
                "Resume uploaded successfully",
                profile.getResumePath()
        ));
    }

    // Update profile skills
    @PutMapping("/{studentId}/profile")
    public ResponseEntity<ApiResponse> updateProfile(
            @PathVariable Integer studentId,
            @RequestParam String skills,
            @RequestParam(required = false) String internshipDetails,
            @RequestParam(required = false, defaultValue = "0")
                Integer certificationScore,
            org.springframework.security.core.Authentication authentication) {

        if (!isAuthorizedStudentOrAdmin(studentId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: You cannot modify this profile", null));
        }

        StudentProfile profile = profileService.updateSkills(
                studentId, skills, internshipDetails, certificationScore);
        return ResponseEntity.ok(new ApiResponse(
                true, "Profile updated", profile));
    }

    // Get profile
    @GetMapping("/{studentId}/profile")
    public ResponseEntity<ApiResponse> getProfile(
            @PathVariable Integer studentId,
            org.springframework.security.core.Authentication authentication) {
        if (!isAuthorizedStudentOrStaff(studentId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Access denied to student profile", null));
        }
        StudentProfile profile = profileService.getProfile(studentId);
        return ResponseEntity.ok(new ApiResponse(true, "Success", profile));
    }

    private boolean isAuthorizedStudentOrAdmin(Integer studentId, org.springframework.security.core.Authentication authentication) {
        if (authentication == null) return false;
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return true;

        return studentRepo.findById(studentId)
                .map(s -> s.getEmail().equalsIgnoreCase(authentication.getName()))
                .orElse(false);
    }

    private boolean isAuthorizedStudentOrStaff(Integer studentId, org.springframework.security.core.Authentication authentication) {
        if (authentication == null) return false;
        boolean isStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_COMPANY"));
        if (isStaff) return true;

        return studentRepo.findById(studentId)
                .map(s -> s.getEmail().equalsIgnoreCase(authentication.getName()))
                .orElse(false);
    }

    @GetMapping("/{studentId}/resume")
    public ResponseEntity<?> downloadResume(
            @PathVariable Integer studentId,
            org.springframework.security.core.Authentication authentication) {

        if (!isAuthorizedStudentOrStaff(studentId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Access denied to resume", null));
        }

        StudentProfile profile = profileService.getProfile(studentId);
        String path = profile.getResumePath();

        if (path == null || path.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, "No resume has been uploaded yet", null));
        }

        try {
            Path filePath = Paths.get(path);
            if (!Files.exists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(false, "Resume file not found on disk", null));
            }

            byte[] fileBytes = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_PDF_VALUE;
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName().toString() + "\"")
                    .body(fileBytes);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Could not read resume file", null));
        }
    }
}
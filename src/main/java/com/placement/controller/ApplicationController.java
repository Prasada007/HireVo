package com.placement.controller;

import com.placement.dto.ApiResponse;
import com.placement.model.Application;
import com.placement.repository.StudentRepo;
import com.placement.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private StudentRepo studentRepo;

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse> apply(@RequestParam("studentId") Integer studentId,
                                             @RequestParam("driveId") Integer driveId,
                                             Authentication authentication) {
        if (!isAuthorizedStudentOrAdmin(studentId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: You can only apply for your own account", null));
        }
        try {
            Application application = applicationService.apply(studentId, driveId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Applied successfully", application));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse> getByStudent(@PathVariable("studentId") Integer studentId,
                                                    Authentication authentication) {
        if (!isAuthorizedStudentOrStaff(studentId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Access denied to student applications", null));
        }
        List<Application> applications = applicationService.getByStudent(studentId);
        return ResponseEntity.ok(new ApiResponse(true, "Applications fetched", applications));
    }

    @GetMapping("/drive/{driveId}")
    public ResponseEntity<ApiResponse> getByDrive(@PathVariable("driveId") Integer driveId) {
        List<Application> applications = applicationService.getByDrive(driveId);
        return ResponseEntity.ok(new ApiResponse(true, "Applications fetched", applications));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateStatus(@PathVariable("id") Integer id,
                                                    @RequestParam("value") String value,
                                                    Authentication authentication) {
        boolean isStudent = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
        if (isStudent) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Students cannot alter application status", null));
        }
        try {
            Application application = applicationService.updateStatus(id, value);
            return ResponseEntity.ok(new ApiResponse(true, "Application status updated", application));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    private boolean isAuthorizedStudentOrAdmin(Integer studentId, Authentication authentication) {
        if (authentication == null) return false;
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return true;

        return studentRepo.findById(studentId)
                .map(s -> s.getEmail().equalsIgnoreCase(authentication.getName()))
                .orElse(false);
    }

    private boolean isAuthorizedStudentOrStaff(Integer studentId, Authentication authentication) {
        if (authentication == null) return false;
        boolean isStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_COMPANY"));
        if (isStaff) return true;

        return studentRepo.findById(studentId)
                .map(s -> s.getEmail().equalsIgnoreCase(authentication.getName()))
                .orElse(false);
    }
}

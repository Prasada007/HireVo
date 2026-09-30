package com.placement.controller;

import com.placement.dto.ApiResponse;
import com.placement.model.ShortlistedCandidate;
import com.placement.model.Student;
import com.placement.repository.StudentRepo;
import com.placement.service.AutoShortlistService;
import com.placement.service.EligibilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eligibility")
public class EligibilityController {

    @Autowired
    private EligibilityService eligibilityService;

    @Autowired
    private AutoShortlistService autoShortlistService;

    @Autowired
    private StudentRepo studentRepo;

    // Check if one student is eligible for a company
    @GetMapping("/check")
    public ResponseEntity<ApiResponse> checkEligibility(
            @RequestParam Integer studentId,
            @RequestParam Integer requestId) {

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        boolean eligible = eligibilityService.isEligible(student, requestId);
        List<String> reasons = eligible ? List.of() :
                eligibilityService.getIneligibilityReasons(student, requestId);

        return ResponseEntity.ok(new ApiResponse(
                eligible,
                eligible ? "Student is eligible" : "Student is not eligible",
                reasons
        ));
    }

    // Auto-shortlist all eligible students for a drive
    @PostMapping("/shortlist/{driveId}")
    public ResponseEntity<ApiResponse> autoShortlist(
            @PathVariable Integer driveId,
            org.springframework.security.core.Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Only administrators can execute auto-shortlisting", null));
        }
        List<ShortlistedCandidate> result =
                autoShortlistService.autoShortlist(driveId);
        return ResponseEntity.ok(new ApiResponse(
            true,
            result.size() + " students shortlisted",
            result
        ));
    }

    // Get shortlisted candidates for a drive
    @GetMapping("/shortlisted/{driveId}")
    public ResponseEntity<ApiResponse> getShortlisted(@PathVariable Integer driveId) {
        List<ShortlistedCandidate> list =
                autoShortlistService.getShortlistedByDrive(driveId);
        return ResponseEntity.ok(new ApiResponse(true, "Success", list));
    }
}
package com.placement.controller;

import com.placement.dto.ApiResponse;
import com.placement.model.PlacementRequest;
import com.placement.service.PlacementRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class PlacementRequestController {

    @Autowired
    private PlacementRequestService requestService;

    @PostMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse> createRequest(
            @PathVariable Integer companyId,
            @RequestBody PlacementRequest req,
            org.springframework.security.core.Authentication authentication) {
        boolean isStudent = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
        if (isStudent) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Students cannot create placement requests", null));
        }
        try {
            PlacementRequest created = requestService.createRequest(companyId, req);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Placement request submitted successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse> getCompanyRequests(@PathVariable Integer companyId) {
        List<PlacementRequest> requests = requestService.getRequestsByCompany(companyId);
        return ResponseEntity.ok(new ApiResponse(true, "Requests fetched", requests));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse> getPendingRequests() {
        List<PlacementRequest> requests = requestService.getPendingRequests();
        return ResponseEntity.ok(new ApiResponse(true, "Pending requests fetched", requests));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateStatus(
            @PathVariable Integer id,
            @RequestParam String status,
            org.springframework.security.core.Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Only administrators can update placement request statuses", null));
        }
        try {
            PlacementRequest req = requestService.updateStatus(id, status);
            return ResponseEntity.ok(new ApiResponse(true, "Status updated", req));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }
}

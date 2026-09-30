package com.placement.controller;

import com.placement.dto.ApiResponse;
import com.placement.dto.DriveRequest;
import com.placement.model.PlacementDrive;
import com.placement.service.DriveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drives")
public class DriveController {

    @Autowired
    private DriveService driveService;

    @PostMapping
    public ResponseEntity<ApiResponse> createDrive(
            @RequestBody DriveRequest req,
            org.springframework.security.core.Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Only administrators can schedule drives", null));
        }
        try {
            PlacementDrive drive = driveService.createDrive(req);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Drive created successfully", drive));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllDrives() {
        List<PlacementDrive> drives = driveService.getAllDrives();
        return ResponseEntity.ok(new ApiResponse(true, "Drives fetched", drives));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse> getUpcomingDrives() {
        List<PlacementDrive> drives = driveService.getUpcomingDrives();
        return ResponseEntity.ok(new ApiResponse(true, "Upcoming drives fetched", drives));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getById(@PathVariable("id") Integer id) {
        return driveService.getById(id)
                .map(d -> ResponseEntity.ok(new ApiResponse(true, "Drive found", d)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(false, "Drive not found", null)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateStatus(
            @PathVariable("id") Integer id,
            @RequestParam("value") String value,
            org.springframework.security.core.Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Only administrators can alter drive statuses", null));
        }
        try {
            PlacementDrive drive = driveService.updateStatus(id, value);
            return ResponseEntity.ok(new ApiResponse(true, "Drive status updated", drive));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }
}

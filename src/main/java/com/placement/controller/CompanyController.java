package com.placement.controller;

import com.placement.dto.ApiResponse;
import com.placement.dto.CompanyRequest;
import com.placement.model.Company;
import com.placement.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody CompanyRequest req) {
        try {
            Company company = companyService.registerCompany(req);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Company registered successfully", company));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllCompanies() {
        List<Company> companies = companyService.getAllCompanies();
        return ResponseEntity.ok(new ApiResponse(true, "Companies fetched", companies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getById(@PathVariable("id") Integer id) {
        return companyService.getById(id)
                .map(c -> ResponseEntity.ok(new ApiResponse(true, "Company found", c)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(false, "Company not found", null)));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse> approve(@PathVariable("id") Integer id,
                                               org.springframework.security.core.Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Only administrators can approve companies", null));
        }
        try {
            Company company = companyService.approveCompany(id);
            return ResponseEntity.ok(new ApiResponse(true, "Company approved", company));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse> reject(@PathVariable("id") Integer id,
                                              org.springframework.security.core.Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Only administrators can reject companies", null));
        }
        try {
            Company company = companyService.rejectCompany(id);
            return ResponseEntity.ok(new ApiResponse(true, "Company rejected", company));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }
}

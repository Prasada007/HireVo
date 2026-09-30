package com.placement.controller;

import com.placement.dto.ApiResponse;
import com.placement.dto.StudentRegisterRequest;
import com.placement.model.Student;
import com.placement.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody StudentRegisterRequest req) {
        try {
            Student student = studentService.register(req);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Student registered successfully", student));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllStudents(org.springframework.security.core.Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Only administrators can view the complete student directory", null));
        }
        List<Student> students = studentService.getAllStudents();
        return ResponseEntity.ok(new ApiResponse(true, "Students fetched", students));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getById(@PathVariable("id") Integer id,
                                               org.springframework.security.core.Authentication authentication) {
        if (!isAuthorizedStudentOrStaff(id, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: Access denied to student details", null));
        }
        return studentService.getById(id)
                .map(s -> ResponseEntity.ok(new ApiResponse(true, "Student found", s)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(false, "Student not found", null)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> update(@PathVariable("id") Integer id,
                                              @RequestBody Student updated,
                                              org.springframework.security.core.Authentication authentication) {
        if (!isAuthorizedStudentOrAdmin(id, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Forbidden: You cannot modify this profile", null));
        }
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        try {
            Student student = studentService.update(id, updated, isAdmin);
            return ResponseEntity.ok(new ApiResponse(true, "Student updated", student));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    private boolean isAuthorizedStudentOrAdmin(Integer studentId, org.springframework.security.core.Authentication authentication) {
        if (authentication == null) return false;
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return true;

        return studentService.getById(studentId)
                .map(s -> s.getEmail().equalsIgnoreCase(authentication.getName()))
                .orElse(false);
    }

    private boolean isAuthorizedStudentOrStaff(Integer studentId, org.springframework.security.core.Authentication authentication) {
        if (authentication == null) return false;
        boolean isStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_COMPANY"));
        if (isStaff) return true;

        return studentService.getById(studentId)
                .map(s -> s.getEmail().equalsIgnoreCase(authentication.getName()))
                .orElse(false);
    }
}

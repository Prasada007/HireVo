package com.placement.config;

import com.placement.model.Admin;
import com.placement.repository.AdminRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import jakarta.annotation.PostConstruct;

@Configuration
public class DataInitializer {

    @Autowired
    private AdminRepo adminRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String getEnvOrProp(String name, String fallback) {
        String val = System.getenv(name);
        if (val == null || val.trim().isEmpty()) {
            val = System.getProperty(name);
        }
        return (val != null && !val.trim().isEmpty()) ? val : fallback;
    }

    @PostConstruct
    public void seed() {
        String adminEmail = getEnvOrProp("INITIAL_ADMIN_EMAIL", "admin@spms.com");
        String adminPassword = getEnvOrProp("INITIAL_ADMIN_PASSWORD", "Admin@123");
        String adminName = getEnvOrProp("INITIAL_ADMIN_NAME", "Placement Dean");

        if (adminRepo.findByEmail(adminEmail).isEmpty()) {
            Admin admin = new Admin();
            admin.setName(adminName);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("PLACEMENT_OFFICER");
            adminRepo.save(admin);
            System.out.println("=== DEFAULT ADMIN INITIALIZED for email: " + adminEmail + " ===");
        }
    }
}

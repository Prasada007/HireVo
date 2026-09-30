package com.placement.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class FileStorageConfig {
    // Folder where resumes will be saved on your server
    public static final String RESUME_UPLOAD_DIR;

    static {
        String uploadDir = System.getProperty("UPLOAD_DIR");
        if (uploadDir == null || uploadDir.trim().isEmpty()) {
            uploadDir = System.getenv("UPLOAD_DIR");
        }
        if (uploadDir == null || uploadDir.trim().isEmpty()) {
            String userHome = System.getProperty("user.home", ".");
            uploadDir = userHome + java.io.File.separator + "spms-resumes" + java.io.File.separator;
        }
        if (!uploadDir.endsWith(java.io.File.separator) && !uploadDir.endsWith("/")) {
            uploadDir += java.io.File.separator;
        }

        try {
            java.io.File dir = new java.io.File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
        } catch (Exception ignored) {
        }

        RESUME_UPLOAD_DIR = uploadDir;
    }
}
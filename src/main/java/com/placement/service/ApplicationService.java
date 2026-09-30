package com.placement.service;

import com.placement.model.Application;
import com.placement.model.PlacementDrive;
import com.placement.model.Student;
import com.placement.repository.ApplicationRepo;
import com.placement.repository.PlacementDriveRepo;
import com.placement.repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepo applicationRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private PlacementDriveRepo driveRepo;

    @Autowired
    private EligibilityService eligibilityService;

    @Autowired
    private NotificationService notificationService;

    public Application apply(Integer studentId, Integer driveId) {
        if (applicationRepo.findByStudentIdAndDriveId(studentId, driveId).isPresent()) {
            throw new RuntimeException("Already applied to this drive");
        }
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        PlacementDrive drive = driveRepo.findById(driveId)
                .orElseThrow(() -> new RuntimeException("Drive not found"));

        if (drive.getRequest() != null) {
            boolean eligible = eligibilityService.isEligible(student, drive.getRequest().getId());
            if (!eligible) {
                List<String> reasons = eligibilityService.getIneligibilityReasons(student, drive.getRequest().getId());
                throw new RuntimeException("Not eligible for this drive: " + String.join(", ", reasons));
            }
        }

        Application application = new Application();
        application.setStudent(student);
        application.setDrive(drive);
        application.setStatus("APPLIED");
        Application saved = applicationRepo.save(application);

        // Real-time alert to the company recruiter
        if (drive.getCompany() != null && drive.getCompany().getEmail() != null) {
            try {
                notificationService.sendToUser(drive.getCompany().getEmail(), "NEW_APPLICANT", java.util.Map.of(
                        "driveId", driveId,
                        "studentId", student.getId(),
                        "studentName", student.getName(),
                        "branch", student.getBranch(),
                        "cgpa", student.getCgpa(),
                        "message", student.getName() + " (" + student.getBranch() + ") applied to your drive."
                ));
            } catch (Exception ignored) {}
        }

        return saved;
    }

    public List<Application> getByStudent(Integer studentId) {
        return applicationRepo.findByStudentId(studentId);
    }

    public List<Application> getByDrive(Integer driveId) {
        return applicationRepo.findByDriveId(driveId);
    }

    public Application updateStatus(Integer id, String status) {
        Application app = applicationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(status);
        return applicationRepo.save(app);
    }
}
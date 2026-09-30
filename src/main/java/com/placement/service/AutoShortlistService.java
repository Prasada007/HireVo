package com.placement.service;

import com.placement.model.PlacementDrive;
import com.placement.model.ShortlistedCandidate;
import com.placement.model.Student;
import com.placement.repository.PlacementDriveRepo;
import com.placement.repository.ShortlistedCandidateRepo;
import com.placement.repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AutoShortlistService {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private PlacementDriveRepo driveRepo;

    @Autowired
    private ShortlistedCandidateRepo shortlistRepo;

    @Autowired
    private EligibilityService eligibilityService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public List<ShortlistedCandidate> autoShortlist(Integer driveId) {
        PlacementDrive drive = driveRepo.findById(driveId)
                .orElseThrow(() -> new RuntimeException("Drive not found"));

        if (drive.getRequest() == null) {
            throw new RuntimeException("Placement drive is not linked to any recruitment request rules");
        }

        // Pre-fetch all already shortlisted student IDs for this drive into a Set (O(1) lookup)
        Set<Integer> alreadyShortlistedStudentIds = shortlistRepo.findByDriveId(driveId)
                .stream()
                .map(sc -> sc.getStudent().getId())
                .collect(Collectors.toSet());

        List<Student> allStudents = studentRepo.findAll();
        List<ShortlistedCandidate> toShortlist = new ArrayList<>();

        for (Student student : allStudents) {
            // Skip students who are already shortlisted for this drive
            if (alreadyShortlistedStudentIds.contains(student.getId())) {
                continue;
            }

            // Check eligibility passing the pre-loaded PlacementRequest rule (avoids repeated request DB lookups)
            boolean eligible = eligibilityService.isEligible(student, drive.getRequest());

            if (eligible) {
                ShortlistedCandidate candidate = new ShortlistedCandidate();
                candidate.setStudent(student);
                candidate.setDrive(drive);
                candidate.setRound("INITIAL");
                candidate.setResult("PENDING");
                toShortlist.add(candidate);
                alreadyShortlistedStudentIds.add(student.getId());
            }
        }

        // Batch save all eligible candidates at once instead of individual inserts
        if (!toShortlist.isEmpty()) {
            List<ShortlistedCandidate> saved = shortlistRepo.saveAll(toShortlist);

            // Push real-time alert to each shortlisted candidate
            for (ShortlistedCandidate sc : saved) {
                try {
                    notificationService.sendToUser(sc.getStudent().getEmail(), "SHORTLISTED", java.util.Map.of(
                            "driveId", driveId,
                            "companyName", drive.getCompany().getName(),
                            "round", sc.getRound(),
                            "message", "Congratulations! You have been shortlisted for " + drive.getCompany().getName() + " (" + sc.getRound() + " round)."
                    ));
                } catch (Exception ignored) {}
            }

            return saved;
        }

        return List.of();
    }

    public List<ShortlistedCandidate> getShortlistedByDrive(Integer driveId) {
        return shortlistRepo.findByDriveId(driveId);
    }
}
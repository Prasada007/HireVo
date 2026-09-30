package com.placement.repository;
import com.placement.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepo extends JpaRepository<Application, Integer> {
    List<Application> findByStudentId(Integer studentId);
    List<Application> findByDriveId(Integer driveId);
    Optional<Application> findByStudentIdAndDriveId(Integer studentId, Integer driveId);

    @Query("SELECT COUNT(DISTINCT a.student.id) FROM Application a")
    long countDistinctStudentsApplied();
}
package com.placement.repository;
import com.placement.model.ShortlistedCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ShortlistedCandidateRepo extends JpaRepository<ShortlistedCandidate, Integer> {
    List<ShortlistedCandidate> findByDriveId(Integer driveId);
    List<ShortlistedCandidate> findByStudentId(Integer studentId);

    @Query("SELECT COUNT(DISTINCT sc.student.id) FROM ShortlistedCandidate sc WHERE UPPER(sc.result) = UPPER(:result)")
    long countDistinctStudentsByResultIgnoreCase(@Param("result") String result);
}
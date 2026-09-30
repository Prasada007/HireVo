package com.placement.repository;

import com.placement.model.PlacementRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PlacementRequestRepo extends JpaRepository<PlacementRequest, Integer> {
    List<PlacementRequest> findByCompanyIdOrderByCreatedAtDesc(Integer companyId);
    List<PlacementRequest> findByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT COALESCE(MAX(r.salaryLpa), 0.0) FROM PlacementRequest r")
    Double findMaxSalaryLpa();
}

package com.placement.repository;
import com.placement.model.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlacementDriveRepo extends JpaRepository<PlacementDrive, Integer> {
    List<PlacementDrive> findByStatus(String status);
    List<PlacementDrive> findByCompanyId(Integer companyId);
    long countByStatus(String status);
}
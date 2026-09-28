package com.watermanagement.repository;

import com.watermanagement.model.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MeterReadingRepository extends JpaRepository<MeterReading, String> {
    List<MeterReading> findByCommunityId(String communityId);
}

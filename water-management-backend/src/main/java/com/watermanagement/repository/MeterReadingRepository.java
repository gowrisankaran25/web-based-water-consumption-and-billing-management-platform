package com.watermanagement.repository;

import com.watermanagement.model.MeterReading;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MeterReadingRepository extends MongoRepository<MeterReading, String> {
    List<MeterReading> findByCommunityId(String communityId);
}

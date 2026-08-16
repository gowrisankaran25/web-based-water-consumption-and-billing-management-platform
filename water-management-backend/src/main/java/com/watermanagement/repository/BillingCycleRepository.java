package com.watermanagement.repository;

import com.watermanagement.model.BillingCycle;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingCycleRepository extends MongoRepository<BillingCycle, String> {
    List<BillingCycle> findByCommunityId(String communityId);
    Optional<BillingCycle> findTopByCommunityIdOrderByStartDateDesc(String communityId);
    List<BillingCycle> findByStatus(String status);
}

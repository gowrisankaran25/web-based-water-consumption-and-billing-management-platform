package com.watermanagement.repository;

import com.watermanagement.model.BillingCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingCycleRepository extends JpaRepository<BillingCycle, String> {
    List<BillingCycle> findByCommunityId(String communityId);
    Optional<BillingCycle> findTopByCommunityIdOrderByStartDateDesc(String communityId);
    List<BillingCycle> findByStatus(String status);
}

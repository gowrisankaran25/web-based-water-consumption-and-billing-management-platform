package com.watermanagement.repository;

import com.watermanagement.model.BulkWaterPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BulkWaterPurchaseRepository extends JpaRepository<BulkWaterPurchase, String> {
    List<BulkWaterPurchase> findByCommunityId(String communityId);
    List<BulkWaterPurchase> findByBillingCycleId(String billingCycleId);
}

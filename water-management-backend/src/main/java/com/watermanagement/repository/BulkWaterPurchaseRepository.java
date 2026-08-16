package com.watermanagement.repository;

import com.watermanagement.model.BulkWaterPurchase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BulkWaterPurchaseRepository extends MongoRepository<BulkWaterPurchase, String> {
    List<BulkWaterPurchase> findByCommunityId(String communityId);
    List<BulkWaterPurchase> findByBillingCycleId(String billingCycleId);
}

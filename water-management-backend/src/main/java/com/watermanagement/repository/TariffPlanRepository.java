package com.watermanagement.repository;

import com.watermanagement.model.TariffPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TariffPlanRepository extends MongoRepository<TariffPlan, String> {
    List<TariffPlan> findByCommunityId(String communityId);
}

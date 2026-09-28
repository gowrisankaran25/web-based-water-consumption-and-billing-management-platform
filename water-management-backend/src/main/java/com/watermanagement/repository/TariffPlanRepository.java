package com.watermanagement.repository;

import com.watermanagement.model.TariffPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TariffPlanRepository extends JpaRepository<TariffPlan, String> {
    List<TariffPlan> findByCommunityId(String communityId);
}

package com.watermanagement.repository;

import com.watermanagement.model.Household;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HouseholdRepository extends JpaRepository<Household, String> {
    List<Household> findByCommunityId(String communityId);
    Household findByCommunityIdAndFlatNumber(String communityId, String flatNumber);
}

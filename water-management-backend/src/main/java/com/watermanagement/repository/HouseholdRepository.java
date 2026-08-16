package com.watermanagement.repository;

import com.watermanagement.model.Household;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HouseholdRepository extends MongoRepository<Household, String> {
    List<Household> findByCommunityId(String communityId);
    Household findByCommunityIdAndFlatNumber(String communityId, String flatNumber);
}

package com.watermanagement.repository;

import com.watermanagement.model.Community;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CommunityRepository extends MongoRepository<Community, String> {
    List<Community> findByStatus(String status);
}

package com.watermanagement.repository;

import com.watermanagement.model.NotificationMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationMessageRepository extends MongoRepository<NotificationMessage, String> {
    List<NotificationMessage> findByCommunityId(String communityId);
}

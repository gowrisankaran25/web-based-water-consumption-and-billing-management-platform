package com.watermanagement.repository;

import com.watermanagement.model.ResidentInvitation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ResidentInvitationRepository extends MongoRepository<ResidentInvitation, String> {
    List<ResidentInvitation> findByCommunityId(String communityId);
}

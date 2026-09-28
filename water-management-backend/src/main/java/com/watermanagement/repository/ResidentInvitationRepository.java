package com.watermanagement.repository;

import com.watermanagement.model.ResidentInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResidentInvitationRepository extends JpaRepository<ResidentInvitation, String> {
    List<ResidentInvitation> findByCommunityId(String communityId);
}

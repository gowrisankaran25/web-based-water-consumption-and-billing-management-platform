package com.watermanagement.repository;

import com.watermanagement.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunityRepository extends JpaRepository<Community, String> {
    List<Community> findByStatus(String status);
}

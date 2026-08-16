package com.watermanagement.repository;

import com.watermanagement.model.ServiceTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceTicketRepository extends MongoRepository<ServiceTicket, String> {
    List<ServiceTicket> findByCommunityId(String communityId);
    List<ServiceTicket> findByFlatNumber(String flatNumber);
}

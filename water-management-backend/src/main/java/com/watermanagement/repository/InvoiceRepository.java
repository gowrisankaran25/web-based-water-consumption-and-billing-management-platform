package com.watermanagement.repository;

import com.watermanagement.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    List<Invoice> findByCommunityId(String communityId);
    List<Invoice> findByCommunityIdAndFlatNumber(String communityId, String flatNumber);
}

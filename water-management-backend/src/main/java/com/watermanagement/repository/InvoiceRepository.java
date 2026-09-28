package com.watermanagement.repository;

import com.watermanagement.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    List<Invoice> findByCommunityId(String communityId);
    List<Invoice> findByCommunityIdAndFlatNumber(String communityId, String flatNumber);
}

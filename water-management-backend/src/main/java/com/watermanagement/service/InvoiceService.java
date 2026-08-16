package com.watermanagement.service;

import com.watermanagement.model.Invoice;
import com.watermanagement.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;

    public List<Invoice> getInvoiceByCommunity(String communityId) {
        return invoiceRepository.findByCommunityId(communityId);
    }

    public List<Invoice> getInvoiceByHousehold(String communityId, String flatNumber) {
        return invoiceRepository.findByCommunityIdAndFlatNumber(communityId, flatNumber);
    }
}

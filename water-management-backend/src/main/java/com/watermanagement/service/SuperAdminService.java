package com.watermanagement.service;

import com.watermanagement.model.Community;
import com.watermanagement.model.Household;
import com.watermanagement.model.Invoice;
import com.watermanagement.model.MeterReading;
import com.watermanagement.model.ServiceTicket;
import com.watermanagement.repository.CommunityRepository;
import com.watermanagement.repository.HouseholdRepository;
import com.watermanagement.repository.InvoiceRepository;
import com.watermanagement.repository.MeterReadingRepository;
import com.watermanagement.repository.ServiceTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SuperAdminService {
    
    private final CommunityRepository communityRepository;
    private final HouseholdRepository householdRepository;
    private final InvoiceRepository invoiceRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final ServiceTicketRepository serviceTicketRepository;
    
    public List<Community> getAllCommunities() {
        return communityRepository.findAll();
    }
    
    public Community approveCommunity(String id) {
        Community community = communityRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Community not found"));
        community.setStatus("APPROVED");
        return communityRepository.save(community);
    }
    
    public Community registerCommunity(Community community) {
        community.setStatus("PENDING");
        return communityRepository.save(community);
    }
    
    public List<Household> getAllHouseholds() {
        return householdRepository.findAll();
    }
    
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public List<Invoice> getInvoicesForHousehold(String communityId, String flatNumber) {
        return invoiceRepository.findByCommunityIdAndFlatNumber(communityId, flatNumber);
    }
    
    public List<MeterReading> getAllMeterReadings() {
        return meterReadingRepository.findAll();
    }
    
    public List<ServiceTicket> getAllServiceTickets() {
        return serviceTicketRepository.findAll();
    }
}

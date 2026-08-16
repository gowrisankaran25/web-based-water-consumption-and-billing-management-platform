package com.watermanagement.controller;

import com.watermanagement.model.Community;
import com.watermanagement.model.Household;
import com.watermanagement.model.Invoice;
import com.watermanagement.model.MeterReading;
import com.watermanagement.model.ServiceTicket;
import com.watermanagement.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SuperAdminController {
    
    private final SuperAdminService superAdminService;
    
    @GetMapping("/communities")
    public ResponseEntity<List<Community>> getAllCommunities() {
        return ResponseEntity.ok(superAdminService.getAllCommunities());
    }
    
    @PostMapping("/communities")
    public ResponseEntity<Community> registerCommunity(@RequestBody Community community) {
        return ResponseEntity.ok(superAdminService.registerCommunity(community));
    }
    
    @PatchMapping("/communities/{id}/approve")
    public ResponseEntity<Community> approveCommunity(@PathVariable String id) {
        return ResponseEntity.ok(superAdminService.approveCommunity(id));
    }
    
    @GetMapping("/households")
    public ResponseEntity<List<Household>> getAllHouseholds() {
        return ResponseEntity.ok(superAdminService.getAllHouseholds());
    }
    
    @GetMapping("/invoices")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(superAdminService.getAllInvoices());
    }

    @GetMapping("/invoices/{communityId}/{flatNumber}")
    public ResponseEntity<List<Invoice>> getInvoicesForHousehold(@PathVariable String communityId,
                                                                 @PathVariable String flatNumber) {
        return ResponseEntity.ok(superAdminService.getInvoicesForHousehold(communityId, flatNumber));
    }
    
    @GetMapping("/meters")
    public ResponseEntity<List<MeterReading>> getAllMeterReadings() {
        return ResponseEntity.ok(superAdminService.getAllMeterReadings());
    }
    
    @GetMapping("/tickets")
    public ResponseEntity<List<ServiceTicket>> getAllServiceTickets() {
        return ResponseEntity.ok(superAdminService.getAllServiceTickets());
    }
}

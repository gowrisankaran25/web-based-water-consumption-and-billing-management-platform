package com.watermanagement.controller;

import com.watermanagement.model.ServiceTicket;
import com.watermanagement.repository.ServiceTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ServiceTicketController {

    private final ServiceTicketRepository ticketRepository;

    @PostMapping("/create")
    @PreAuthorize("hasRole('RESIDENT') or hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<?> createTicket(@RequestBody ServiceTicket ticket) {
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
        return ResponseEntity.ok().body("{\"message\": \"Ticket submitted successfully\"}");
    }

    @GetMapping("/community/{communityId}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN') or hasRole('FIELD_TECH')")
    public ResponseEntity<List<ServiceTicket>> getCommunityTickets(@PathVariable String communityId) {
        return ResponseEntity.ok(ticketRepository.findByCommunityId(communityId));
    }

    @GetMapping("/flat/{flatNumber}")
    @PreAuthorize("hasRole('RESIDENT') or hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<List<ServiceTicket>> getFlatTickets(@PathVariable String flatNumber) {
        return ResponseEntity.ok(ticketRepository.findByFlatNumber(flatNumber));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN') or hasRole('FIELD_TECH')")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestParam String status) {
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setStatus(status);
            if ("RESOLVED".equals(status)) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
            ticketRepository.save(ticket);
            return ResponseEntity.ok().body("{\"message\": \"Ticket status updated\"}");
        }).orElse(ResponseEntity.notFound().build());
    }
}

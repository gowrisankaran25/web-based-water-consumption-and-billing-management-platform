package com.watermanagement.controller;

import com.watermanagement.model.ResidentInvitation;
import com.watermanagement.service.CommunityAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communityadmin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommunityAdminController {
    
    private final CommunityAdminService communityAdminService;
    
    @PostMapping("/invitations")
    public ResponseEntity<ResidentInvitation> inviteResident(@RequestBody ResidentInvitation invitation) {
        return ResponseEntity.ok(communityAdminService.inviteResident(invitation));
    }
    
    @GetMapping("/invitations/{communityId}")
    public ResponseEntity<List<ResidentInvitation>> getInvitations(@PathVariable String communityId) {
        return ResponseEntity.ok(communityAdminService.getInvitations(communityId));
    }

    @PostMapping("/meters")
    public ResponseEntity<?> submitMeterReading(@RequestBody com.watermanagement.model.MeterReading reading) {
        return ResponseEntity.ok(communityAdminService.saveMeterReading(reading));
    }

    @PostMapping("/meters/upload/{communityId}")
    public ResponseEntity<?> uploadMeterReadingsCsv(
            @PathVariable String communityId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            int count = communityAdminService.bulkUploadMeters(communityId, file);
            return ResponseEntity.ok(java.util.Map.of("message", "Successfully uploaded " + count + " readings."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/meters/{communityId}")
    public ResponseEntity<?> getMeterReadings(@PathVariable String communityId) {
        return ResponseEntity.ok(communityAdminService.getMeterReadings(communityId));
    }

    @PatchMapping("/meters/{readingId}/status")
    public ResponseEntity<?> updateMeterReadingStatus(@PathVariable String readingId, @RequestBody java.util.Map<String, String> payload) {
        return ResponseEntity.ok(communityAdminService.updateMeterReadingStatus(readingId, payload.get("status")));
    }

    @PatchMapping("/tariff/{communityId}")
    public ResponseEntity<?> updateTariff(@PathVariable String communityId, @RequestBody java.util.Map<String, Double> payload) {
        return ResponseEntity.ok(communityAdminService.updateTariff(communityId, payload.get("tariffRate")));
    }

    @PatchMapping("/threshold/{communityId}")
    public ResponseEntity<?> updateUsageThreshold(@PathVariable String communityId,
                                                  @RequestBody java.util.Map<String, Object> payload) {
        return ResponseEntity.ok(communityAdminService.updateUsageThreshold(
                communityId,
                (String) payload.get("flatNumber"),
                ((Number) payload.get("waterUsageThreshold")).intValue())
        );
    }

    @PostMapping("/invoices/{communityId}")
    public ResponseEntity<?> generateInvoices(@PathVariable String communityId) {
        return ResponseEntity.ok(communityAdminService.generateInvoices(communityId));
    }

    @GetMapping("/invoices/{communityId}")
    public ResponseEntity<?> getInvoices(@PathVariable String communityId) {
        return ResponseEntity.ok(communityAdminService.getInvoices(communityId));
    }

    @GetMapping("/households/{communityId}")
    public ResponseEntity<?> getHouseholds(@PathVariable String communityId) {
        return ResponseEntity.ok(communityAdminService.getHouseholds(communityId));
    }
}

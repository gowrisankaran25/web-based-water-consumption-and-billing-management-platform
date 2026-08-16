package com.watermanagement.controller;

import com.watermanagement.model.NotificationMessage;
import com.watermanagement.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationService notificationService;

    @PostMapping("/email")
    public ResponseEntity<NotificationMessage> sendEmail(@RequestParam String communityId,
                                                          @RequestParam String flatNumber,
                                                          @RequestParam String email,
                                                          @RequestParam String title,
                                                          @RequestParam String message) {
        return ResponseEntity.ok(notificationService.sendEmail(communityId, flatNumber, email, title, message));
    }

    @PostMapping("/in-app")
    public ResponseEntity<NotificationMessage> sendInApp(@RequestParam String communityId,
                                                          @RequestParam String householdId,
                                                          @RequestParam String flatNumber,
                                                          @RequestParam String title,
                                                          @RequestParam String message) {
        return ResponseEntity.ok(notificationService.sendInApp(communityId, householdId, flatNumber, title, message));
    }

    @GetMapping("/{communityId}")
    public ResponseEntity<List<NotificationMessage>> getByCommunity(@PathVariable String communityId) {
        return ResponseEntity.ok(notificationService.getByCommunity(communityId));
    }
}

package com.watermanagement.service;

import com.watermanagement.model.NotificationMessage;
import com.watermanagement.repository.NotificationMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationMessageRepository notificationMessageRepository;

    public NotificationMessage sendEmail(String communityId, String flatNumber, String email, String title, String message) {
        NotificationMessage notification = new NotificationMessage();
        notification.setCommunityId(communityId);
        notification.setFlatNumber(flatNumber);
        notification.setRecipientEmail(email);
        notification.setChannel("EMAIL");
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setStatus("SENT");
        return notificationMessageRepository.save(notification);
    }

    public NotificationMessage sendInApp(String communityId, String householdId, String flatNumber, String title, String message) {
        NotificationMessage notification = new NotificationMessage();
        notification.setCommunityId(communityId);
        notification.setHouseholdId(householdId);
        notification.setFlatNumber(flatNumber);
        notification.setChannel("IN_APP");
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setStatus("SENT");
        return notificationMessageRepository.save(notification);
    }

    public List<NotificationMessage> getByCommunity(String communityId) {
        return notificationMessageRepository.findByCommunityId(communityId);
    }
}

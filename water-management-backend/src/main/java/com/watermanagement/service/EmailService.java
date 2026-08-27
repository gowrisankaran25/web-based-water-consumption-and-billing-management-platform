package com.watermanagement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendMonthlyBill(String toEmail, String residentName, double amount, String dueDate) {
        String subject = "Your Monthly Water Bill is Ready";
        String body = String.format("Dear %s,\n\nYour monthly water bill of ₹%.2f has been generated and is due by %s.\n\n" +
                "Please login to your dashboard to view the detailed PDF and complete your payment.\n\nThank you,\nWater Management Team", 
                residentName, amount, dueDate);
        sendGenericEmail(toEmail, subject, body);
    }

    public void sendOveruseAlert(String toEmail, String residentName, double usage, String threshold) {
        String subject = "Alert: High Water Consumption Detected";
        String body = String.format("Dear %s,\n\nWe noticed your water consumption has reached %s L, which exceeds the normal threshold of %s L.\n\n" +
                "Water Saving Tips:\n- Check for leaking taps or toilets.\n- Turn off the tap while brushing.\n- Only run washing machines with a full load.\n\n" +
                "Conserving water helps the community and lowers your bill!\n\nBest,\nWater Management Team", 
                residentName, usage, threshold);
        sendGenericEmail(toEmail, subject, body);
    }

    public void sendAnomalyReportToAdmin(String adminEmail, String communityName, String details) {
        String subject = "Anomaly Detection Report - " + communityName;
        String body = "Dear Admin,\n\nThe following anomalies have been detected in your water network:\n\n" + details + 
                "\n\nPlease inspect the system for potential leaks or NRW issues.\n\nRegards,\nAlert Engine";
        sendGenericEmail(adminEmail, subject, body);
    }

    public void sendGenericEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@watermanagement.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            // mailSender.send(message); // Commented out to prevent real SMTP errors in dev without server
            log.info("============== MOCK EMAIL SENT ==============");
            log.info("To: {}", to);
            log.info("Subject: {}", subject);
            log.info("Body:\n{}", text);
            log.info("=============================================");
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
        }
    }
}


package com.watermanagement.controller;

import com.razorpay.RazorpayException;
import com.watermanagement.model.PaymentTransaction;
import com.watermanagement.service.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            PaymentTransaction transaction = paymentService.createOrder(request.getInvoiceId());
            return ResponseEntity.ok(transaction);
        } catch (RazorpayException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifySignature(@RequestBody VerifySignatureRequest request) {
        boolean isValid = paymentService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (isValid) {
            return ResponseEntity.ok(Map.of("status", "SUCCESS"));
        } else {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid payment signature"));
        }
    }

    @PostMapping("/mock-pay")
    public ResponseEntity<?> mockPay(@RequestBody CreateOrderRequest request) {
        boolean success = paymentService.mockPay(request.getInvoiceId());
        if (success) {
            return ResponseEntity.ok(Map.of("status", "SUCCESS"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to mock payment"));
        }
    }
}

@Data
class CreateOrderRequest {
    private String invoiceId;
}

@Data
class VerifySignatureRequest {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}

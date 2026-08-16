package com.watermanagement.service;

import com.razorpay.RazorpayException;
import com.watermanagement.model.Invoice;
import com.watermanagement.model.PaymentTransaction;
import com.watermanagement.repository.InvoiceRepository;
import com.watermanagement.repository.PaymentTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentServiceTest {

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @InjectMocks
    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(paymentService, "razorpayKeyId", "test_key");
        ReflectionTestUtils.setField(paymentService, "razorpayKeySecret", "test_secret");
    }

    @Test
    void createOrder_InvoiceAlreadyPaid_ThrowsException() {
        Invoice invoice = new Invoice();
        invoice.setId("inv_1");
        invoice.setStatus("PAID");

        when(invoiceRepository.findById("inv_1")).thenReturn(Optional.of(invoice));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            paymentService.createOrder("inv_1");
        });

        assertEquals("Invoice is already paid", exception.getMessage());
    }

    @Test
    void verifySignature_TransactionNotFound_ReturnsFalse() {
        when(paymentTransactionRepository.findByRazorpayOrderId("order_123")).thenReturn(null);
        
        boolean result = paymentService.verifySignature("order_123", "pay_123", "sig_123");
        
        assertFalse(result);
    }
}

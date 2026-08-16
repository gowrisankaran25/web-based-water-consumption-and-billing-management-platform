package com.watermanagement.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.watermanagement.model.Invoice;
import com.watermanagement.model.PaymentTransaction;
import com.watermanagement.repository.InvoiceRepository;
import com.watermanagement.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final InvoiceRepository invoiceRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentTransaction createOrder(String invoiceId) throws RazorpayException {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if ("PAID".equals(invoice.getStatus())) {
            throw new RuntimeException("Invoice is already paid");
        }

        System.out.println("DEBUG RAZORPAY KEY ID: [" + razorpayKeyId + "]");
        System.out.println("DEBUG RAZORPAY SECRET: [" + razorpayKeySecret + "]");
        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        // Razorpay expects amount in paise (multiply by 100)
        int amountInPaise = (int) Math.round(invoice.getAmount() * 100);
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + invoiceId);

        Order order = razorpayClient.orders.create(orderRequest);

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setInvoiceId(invoiceId);
        transaction.setRazorpayOrderId(order.get("id"));
        transaction.setAmount(invoice.getAmount());
        transaction.setStatus("CREATED");
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());

        return paymentTransactionRepository.save(transaction);
    }

    public boolean mockPay(String invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId).orElse(null);
        if (invoice != null) {
            invoice.setStatus("PAID");
            invoiceRepository.save(invoice);
            
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setInvoiceId(invoiceId);
            transaction.setAmount(invoice.getAmount());
            transaction.setStatus("PAID");
            transaction.setCreatedAt(LocalDateTime.now());
            transaction.setUpdatedAt(LocalDateTime.now());
            paymentTransactionRepository.save(transaction);
            
            return true;
        }
        return false;
    }

    public boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            PaymentTransaction transaction = paymentTransactionRepository.findByRazorpayOrderId(razorpayOrderId);
            if (transaction == null) {
                return false;
            }

            if (isValid) {
                transaction.setRazorpayPaymentId(razorpayPaymentId);
                transaction.setRazorpaySignature(razorpaySignature);
                transaction.setStatus("PAID");
                transaction.setUpdatedAt(LocalDateTime.now());
                paymentTransactionRepository.save(transaction);

                Invoice invoice = invoiceRepository.findById(transaction.getInvoiceId()).orElse(null);
                if (invoice != null) {
                    invoice.setStatus("PAID");
                    invoice.setPaymentTransactionId(transaction.getId());
                    invoiceRepository.save(invoice);
                }
                return true;
            } else {
                transaction.setStatus("FAILED");
                transaction.setUpdatedAt(LocalDateTime.now());
                paymentTransactionRepository.save(transaction);
                return false;
            }
        } catch (RazorpayException e) {
            e.printStackTrace();
            return false;
        }
    }
}

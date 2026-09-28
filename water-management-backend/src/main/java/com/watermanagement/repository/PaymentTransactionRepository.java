package com.watermanagement.repository;

import com.watermanagement.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, String> {
    PaymentTransaction findByRazorpayOrderId(String razorpayOrderId);
}

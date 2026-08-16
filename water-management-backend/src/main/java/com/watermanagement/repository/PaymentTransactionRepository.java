package com.watermanagement.repository;

import com.watermanagement.model.PaymentTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction, String> {
    PaymentTransaction findByRazorpayOrderId(String razorpayOrderId);
}

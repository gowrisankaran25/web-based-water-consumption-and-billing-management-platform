package com.watermanagement.model;

import lombok.Data;
import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String username; // Email or Login ID
    private String password;
    
    // Roles: SUPER_ADMIN, COMMUNITY_ADMIN, RESIDENT
    private String role;
    
    // Null if Super Admin
    private String communityId;
    
    // Null unless role is RESIDENT
    private String householdId; 
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private String resetPasswordToken;
    private LocalDateTime resetPasswordExpires;
}

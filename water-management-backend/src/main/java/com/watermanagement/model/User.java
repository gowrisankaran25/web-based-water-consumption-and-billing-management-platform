package com.watermanagement.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {
    @Id
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
}

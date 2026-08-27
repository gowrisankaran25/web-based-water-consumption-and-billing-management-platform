package com.watermanagement.controller;

import com.watermanagement.model.User;
import com.watermanagement.model.Community;
import com.watermanagement.model.Household;
import com.watermanagement.repository.UserRepository;
import com.watermanagement.repository.CommunityRepository;
import com.watermanagement.repository.HouseholdRepository;
import com.watermanagement.security.JwtUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final HouseholdRepository householdRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @GetMapping("/communities")
    public ResponseEntity<?> getApprovedCommunities() {
        return ResponseEntity.ok(communityRepository.findAll().stream()
                .filter(c -> "APPROVED".equals(c.getStatus()))
                .map(c -> {
                    java.util.Map<String, String> map = new java.util.HashMap<>();
                    map.put("id", c.getId());
                    map.put("name", c.getName());
                    return map;
                })
                .toList());
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
            
            String flatNumber = null;
            String residentName = null;
            
            if ("RESIDENT".equals(user.getRole()) && user.getHouseholdId() != null) {
                java.util.Optional<Household> householdOpt = householdRepository.findById(user.getHouseholdId());
                if (householdOpt.isPresent()) {
                    flatNumber = householdOpt.get().getFlatNumber();
                    residentName = householdOpt.get().getResidentName();
                }
            }

            return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getUsername(), user.getRole(), user.getCommunityId(), user.getHouseholdId(), flatNumber, residentName));
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid username or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole());

        if ("COMMUNITY_ADMIN".equals(registerRequest.getRole())) {
            Community community = new Community();
            community.setName(registerRequest.getCommunityName());
            community.setAdminName(registerRequest.getFullName());
            community.setAdminEmail(registerRequest.getUsername());
            community.setAdminPhone(registerRequest.getPhone());
            community.setTotalFlats(registerRequest.getTotalFlats() != null ? registerRequest.getTotalFlats() : 0);
            community.setStatus("PENDING");
            community = communityRepository.save(community);
            
            user.setCommunityId(community.getId());
        }

        user = userRepository.save(user);

        if ("RESIDENT".equals(registerRequest.getRole()) && registerRequest.getCommunityId() != null) {
            Household household = new Household();
            household.setCommunityId(registerRequest.getCommunityId());
            household.setFlatNumber(registerRequest.getFlatNumber());
            household.setResidentName(registerRequest.getFullName());
            household.setResidentEmail(registerRequest.getUsername());
            household.setResidentPhone(registerRequest.getPhone());
            household.setOccupants(registerRequest.getOccupants());
            household.setMoveInDate(registerRequest.getMoveInDate());
            household.setUserId(user.getId());
            household.setDisconnectionStatus(false);
            
            household = householdRepository.save(household);
            user.setCommunityId(registerRequest.getCommunityId());
            user.setHouseholdId(household.getId());
            userRepository.save(user);
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        java.util.Optional<User> userOpt = userRepository.findByUsername(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found with this email."));
        }
        
        User user = userOpt.get();
        String token = java.util.UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpires(java.time.LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        // Use a mock email service logic or just return success for now.
        // In a real application, you would email this link:
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        System.out.println("Password reset link for " + request.getEmail() + ": " + resetLink);
        
        // Returning the link in the message for testing/development purposes
        return ResponseEntity.ok(new MessageResponse("Password reset instructions sent. DEV MODE: Click this link to reset: " + resetLink));
    }

    @PostMapping("/force-reset")
    public ResponseEntity<?> forceResetPassword(@RequestBody ForceResetRequest request) {
        java.util.Optional<User> userOpt = userRepository.findByUsername(request.getEmail());
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found."));
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Password successfully reset."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        java.util.Optional<User> userOpt = userRepository.findByResetPasswordToken(request.getToken());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid or expired reset token."));
        }
        
        User user = userOpt.get();
        if (user.getResetPasswordExpires().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Token has expired."));
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpires(null);
        userRepository.save(user);
        
        return ResponseEntity.ok(new MessageResponse("Password successfully reset. You can now log in."));
    }
}

@Data
class MessageResponse {
    private String message;
    public MessageResponse(String message) { this.message = message; }
}

@Data
class RegisterRequest {
    private String username;
    private String password;
    private String role; // RESIDENT or COMMUNITY_ADMIN
    
    // Shared fields
    private String fullName;
    private String phone;
    
    // Admin fields
    private String communityName;
    private Integer totalFlats;
    
    // Resident fields
    private String communityId;
    private String flatNumber;
    private Integer occupants;
    private java.time.LocalDate moveInDate;
}

@Data
class LoginRequest {
    private String username;
    private String password;
}

@Data
class ForgotPasswordRequest {
    private String email;
}

@Data
class ForceResetRequest {
    private String email;
    private String newPassword;
    public String getEmail() { return email; }
    public String getNewPassword() { return newPassword; }
}

@Data
class ResetPasswordRequest {
    private String token;
    private String newPassword;
}

@Data
class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String username;
    private String role;
    private String communityId;
    private String householdId;
    private String flatNumber;
    private String residentName;

    public JwtResponse(String token, String id, String username, String role, String communityId, String householdId) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.role = role;
        this.communityId = communityId;
        this.householdId = householdId;
    }
    
    public JwtResponse(String token, String id, String username, String role, String communityId, String householdId, String flatNumber, String residentName) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.role = role;
        this.communityId = communityId;
        this.householdId = householdId;
        this.flatNumber = flatNumber;
        this.residentName = residentName;
    }
}


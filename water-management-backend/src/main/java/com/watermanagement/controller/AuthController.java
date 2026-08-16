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

            return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getUsername(), user.getRole(), user.getCommunityId(), user.getHouseholdId()));
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
class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String username;
    private String role;
    private String communityId;
    private String householdId;

    public JwtResponse(String token, String id, String username, String role, String communityId, String householdId) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.role = role;
        this.communityId = communityId;
        this.householdId = householdId;
    }
}

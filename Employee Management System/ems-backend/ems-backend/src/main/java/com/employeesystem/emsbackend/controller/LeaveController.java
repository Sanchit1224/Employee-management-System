package com.employeesystem.emsbackend.controller;

import com.employeesystem.emsbackend.entity.LeaveRequest;
import com.employeesystem.emsbackend.entity.Role;
import com.employeesystem.emsbackend.entity.User;

import com.employeesystem.emsbackend.service.LeaveService;
import com.employeesystem.emsbackend.service.UserService;
import com.employeesystem.emsbackend.utils.JwtUtil;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/leave")
//@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class LeaveController {
    private final LeaveService leaveService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    // ✅ User: Apply for Leave
    @PostMapping("/apply")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> applyLeave(@RequestHeader("Authorization") String token,
                                             @RequestBody Map<String, String> requestBody) {

        if (!requestBody.containsKey("reason") || !requestBody.containsKey("startDate") || !requestBody.containsKey("endDate")) {
            return ResponseEntity.status(400).body("❌ Start date, end date, and reason are required!");
        }

        Optional<User> optionalUser = userService.findById(Long.parseLong(requestBody.get("userId")));
        if (optionalUser.isEmpty()) return ResponseEntity.status(404).body("❌ User not found");

        // ✅ Convert String dates to LocalDate
        LocalDate startDate = LocalDate.parse(requestBody.get("startDate"));
        LocalDate endDate = LocalDate.parse(requestBody.get("endDate"));

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setUser(optionalUser.get());
        leaveRequest.setReason(requestBody.get("reason"));
        leaveRequest.setStartDate(startDate);
        leaveRequest.setEndDate(endDate);
        leaveRequest.setStatus("PENDING");

        leaveService.saveLeaveRequest(leaveRequest);

        return ResponseEntity.ok("✅ Leave request submitted for approval");

    }

    // ✅ Admin: View All Leave Requests
    @GetMapping("/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getLeaveRequests(@RequestHeader("Authorization") String token) {
        String username = extractUsername(token);
        System.out.println("🔹 Fetch Leave Requests API called by: " + username);

        if (username == null) {
            System.out.println("❌ Invalid Token: No username found");
            return ResponseEntity.status(401).body("Invalid token");
        }

        Optional<User> optionalUser = userService.findByUsername(username);
        if (optionalUser.isEmpty()) {
            System.out.println("❌ User not found");
            return ResponseEntity.status(404).body("User not found");
        }
        User user = optionalUser.get();

        System.out.println("🔹 User Role: " + user.getRole());

        if (!user.getRole().equals(Role.ADMIN)) {
            System.out.println("❌ Access Denied: User is not an Admin");
            return ResponseEntity.status(403).body("Forbidden");
        }
        List<LeaveRequest> leaveRequests = leaveService.getAllLeaveRequests();
        System.out.println("✅ Returning Leave Requests: " + leaveRequests.size());
        return ResponseEntity.ok(leaveRequests);
    }



    // ✅ Admin: Approve Leave
    @PutMapping("/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> approveLeave(@PathVariable Long id) {
        leaveService.updateLeaveStatus(id, "APPROVED");
        return ResponseEntity.ok("✅ Leave request approved");
    }

    // ✅ Admin: Deny Leave
    @PutMapping("/deny/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> denyLeave(@PathVariable Long id) {
        leaveService.updateLeaveStatus(id, "DENIED");
        return ResponseEntity.ok(" Leave request denied");
    }

    // 🔥 Utility Method to Extract Username from Token
    private String extractUsername(String token) {
        if (token == null || !token.startsWith("Bearer ")) return null;
        return jwtUtil.extractUsername(token.substring(7));
    }
}

package com.employeesystem.emsbackend.controller;

import com.employeesystem.emsbackend.entity.AttendanceRequest;
import com.employeesystem.emsbackend.entity.AttendanceStatus;
import com.employeesystem.emsbackend.entity.LeaveRequest;
import com.employeesystem.emsbackend.entity.User;
import com.employeesystem.emsbackend.service.AttendanceService;
import com.employeesystem.emsbackend.service.LeaveService;
import com.employeesystem.emsbackend.service.UserService;
import com.employeesystem.emsbackend.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/user")
//@CrossOrigin(origins = "http://localhost:5173") // ✅ Allow frontend access
public class AttendanceController {

    private static final Logger LOGGER = Logger.getLogger(AttendanceController.class.getName());

    @Autowired
    private AttendanceService attendanceService;

    // 🔥 Mark Attendance ✅
    @PostMapping("/attendance")
    @PreAuthorize("hasRole('USER')") // ✅ Only users can mark attendance
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, String> request) {
        LOGGER.info("Mark Attendance Request: " + request);

        // Validate input
        if (!request.containsKey("userId") || !request.containsKey("status")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields: userId or status"));
        }

        try {
            Long userId = Long.parseLong(request.get("userId"));
            AttendanceStatus status = AttendanceStatus.valueOf(request.get("status").toUpperCase());

            AttendanceRequest attendance = attendanceService.markAttendance(userId, status);
            return ResponseEntity.ok(Map.of("message", "Attendance marked successfully!", "attendance", attendance));

        } catch (NumberFormatException e) {
            LOGGER.severe("Invalid userId: " + request.get("userId"));
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid userId format!"));
        } catch (IllegalArgumentException e) {
            LOGGER.severe("Invalid status: " + request.get("status"));
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status! Allowed values: PRESENT, ABSENT"));
        } catch (Exception e) {
            LOGGER.severe("Error marking attendance: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal Server Error"));
        }
    }

    // 🔥 Get Attendance ✅
    @GetMapping("/attendance/{userId}")
    @PreAuthorize("hasRole('USER')") // ✅ Only users can view their attendance
    public ResponseEntity<?> getAttendance(@PathVariable String userId) {
        LOGGER.info("Fetching attendance for user: " + userId);

        try {
            Long parsedUserId = Long.parseLong(userId);
            List<AttendanceRequest> attendanceList = attendanceService.getAttendanceByUser(parsedUserId);

            if (attendanceList.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "No attendance records found."));
            }
            return ResponseEntity.ok(attendanceList);

        } catch (NumberFormatException e) {
            LOGGER.severe("Invalid userId: " + userId);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid userId format!"));
        } catch (Exception e) {
            LOGGER.severe("Error fetching attendance: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal Server Error"));
        }
    }

}

package com.employeesystem.emsbackend.controller;

import com.employeesystem.emsbackend.entity.Payroll;
import com.employeesystem.emsbackend.service.AuditLogService;
import com.employeesystem.emsbackend.service.PayrollService;
import com.employeesystem.emsbackend.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/user/payroll")
@RequiredArgsConstructor
public class PayrollController {
    private final PayrollService payrollService;
    private final AuditLogService auditLogService;
    private final JwtUtil jwtUtil;

    // ✅ Get Payroll Details by User ID
    @GetMapping("/{userId}")
    public ResponseEntity<Payroll> getPayroll(@PathVariable Long userId) {
        return payrollService.getPayrollByUserId(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ Create or Update Payroll
    @PostMapping("/add")
    public ResponseEntity<?> addPayroll(@RequestHeader("Authorization") String token,
                                        @RequestBody Payroll payroll) {
        Payroll savedPayroll = payrollService.savePayroll(payroll);
        String adminUsername = jwtUtil.extractUsername(token.substring(7));
        Long payrollUserId = savedPayroll.getUser() != null ? savedPayroll.getUser().getId() : null;
        auditLogService.logAction(
                "UPSERT_PAYROLL",
                adminUsername,
                "Updated payroll for user ID: " + payrollUserId + ", period: " + savedPayroll.getPayPeriod()
        );
        return ResponseEntity.ok(savedPayroll);
    }
}

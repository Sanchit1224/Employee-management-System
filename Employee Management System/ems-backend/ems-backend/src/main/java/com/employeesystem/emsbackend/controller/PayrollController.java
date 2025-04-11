package com.employeesystem.emsbackend.controller;

import com.employeesystem.emsbackend.entity.Payroll;
import com.employeesystem.emsbackend.service.PayrollService;
import com.employeesystem.emsbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/user/payroll")
@RequiredArgsConstructor
public class PayrollController {
    private final PayrollService payrollService;
    private final UserService userService;

    // ✅ Get Payroll Details by User ID
    @GetMapping("/{userId}")
    public ResponseEntity<Payroll> getPayroll(@PathVariable Long userId) {
        return payrollService.getPayrollByUserId(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ Create or Update Payroll
    @PostMapping("/add")
    public ResponseEntity<?> addPayroll(@RequestBody Payroll payroll) {
        Payroll savedPayroll = payrollService.savePayroll(payroll);
        return ResponseEntity.ok(savedPayroll);
    }
}

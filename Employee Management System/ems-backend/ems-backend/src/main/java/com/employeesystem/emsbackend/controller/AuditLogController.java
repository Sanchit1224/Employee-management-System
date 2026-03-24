package com.employeesystem.emsbackend.controller;

import com.employeesystem.emsbackend.entity.AuditLog;
import com.employeesystem.emsbackend.service.AuditLogService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
public class AuditLogController {
    private final AuditLogService auditLogService;

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuditLog> getAuditLogs() {
        return auditLogService.getRecentLogs();
    }
}

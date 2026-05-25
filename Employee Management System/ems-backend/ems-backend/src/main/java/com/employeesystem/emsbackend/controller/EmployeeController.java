package com.employeesystem.emsbackend.controller;

import com.employeesystem.emsbackend.dto.EmployeeAccountRequest;
import com.employeesystem.emsbackend.entity.Employee;
import com.employeesystem.emsbackend.service.AuditLogService;
import com.employeesystem.emsbackend.service.EmployeeService;
import com.employeesystem.emsbackend.utils.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/emp")
//@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;
    private final JwtUtil jwtUtil;
    private final AuditLogService auditLogService;

    // ✅ Create Employee (Admin Only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createEmployee(@RequestHeader("Authorization") String token,
                                            @RequestBody EmployeeAccountRequest request) {
        try {
            String adminUsername = jwtUtil.extractUsername(token.substring(7));
            Employee savedEmployee = employeeService.createEmployeeWithAccount(request);
            auditLogService.logAction(
                    "CREATE_EMPLOYEE",
                    adminUsername,
                    "Created employee + user login: " + savedEmployee.getFirstName() + " " + savedEmployee.getLastName()
            );
            return new ResponseEntity<>(savedEmployee, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding employee: " + e.getMessage());
        }
    }

    // ✅ Get Employee by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> findEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.findEmployeeById(id));
    }

    // ✅ Get Employees (Admin -> All, User -> Self)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    // ✅ Update Employee (Admin Only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateEmployee(@RequestHeader("Authorization") String token,
                                            @PathVariable Long id,
                                            @RequestBody EmployeeAccountRequest request) {
        Employee updatedEmp = employeeService.updateEmployee(id, request);
        String adminUsername = jwtUtil.extractUsername(token.substring(7));
        auditLogService.logAction(
                "UPDATE_EMPLOYEE",
                adminUsername,
                "Updated employee ID: " + id
        );
        return ResponseEntity.ok(updatedEmp);
    }

    // ✅ Delete Employee (Admin Only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteEmployee(@RequestHeader("Authorization") String token,
                                            @PathVariable("id") Long id) {
        employeeService.deleteEmployeeById(id);
        String adminUsername = jwtUtil.extractUsername(token.substring(7));
        auditLogService.logAction(
                "DELETE_EMPLOYEE",
                adminUsername,
                "Deleted employee ID: " + id
        );
        return ResponseEntity.ok("Employee deleted successfully.");
    }

    @GetMapping("/email-id/{mail}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Employee> findByEmployeeEmail(@PathVariable("mail") String email){
        return ResponseEntity.ok(employeeService.findEmployeeByEmail(email));
    }
}

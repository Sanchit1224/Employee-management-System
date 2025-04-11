package com.employeesystem.emsbackend.controller;

import com.employeesystem.emsbackend.entity.Employee;
import com.employeesystem.emsbackend.entity.Role;
import com.employeesystem.emsbackend.entity.User;
import com.employeesystem.emsbackend.service.EmployeeService;
import com.employeesystem.emsbackend.service.UserService;
import com.employeesystem.emsbackend.utils.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/emp")
//@CrossOrigin(origins = "http://localhost:5173")
@AllArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    // ✅ Create Employee (Admin Only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createEmployee(@RequestHeader("Authorization") String token,
                                            @RequestBody Employee employee) {
        try {
            // 🔥 Ensure only ADMINs can add employees
            String username = jwtUtil.extractUsername(token.substring(7));

            String adminUsername = jwtUtil.extractUsername(token.substring(7));
            //User admin = userService.findByUsername(adminUsername);
            Employee savedEmployee = employeeService.addEmployee(employee);
            return new ResponseEntity<>(savedEmployee, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding employee: " + e.getMessage());
        }
    }

    // ✅ Get Employee by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> findEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.findEmployeeById(id));
    }

    // ✅ Get Employees (Admin -> All, User -> Self)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    // ✅ Update Employee (Admin Only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Employee updatedEmployee) {
        Employee updatedEmp = employeeService.updateEmployee(id, updatedEmployee);
        return ResponseEntity.ok(updatedEmp);
    }

    // ✅ Delete Employee (Admin Only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteEmployee(@PathVariable("id") Long id) {
        employeeService.deleteEmployeeById(id);
        return ResponseEntity.ok("Employee deleted successfully.");
    }

    @GetMapping("/email-id/{mail}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Employee> findByEmployeeEmail(@PathVariable("mail") String email){
        return ResponseEntity.ok(employeeService.findEmployeeByEmail(email));
    }
}

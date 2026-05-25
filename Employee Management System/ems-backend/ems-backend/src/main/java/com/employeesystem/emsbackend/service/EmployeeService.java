package com.employeesystem.emsbackend.service;

import com.employeesystem.emsbackend.dto.EmployeeAccountRequest;
import com.employeesystem.emsbackend.entity.Employee;
import com.employeesystem.emsbackend.entity.Role;
import com.employeesystem.emsbackend.entity.User;
import com.employeesystem.emsbackend.exception.ResourceNotFoundException;
import com.employeesystem.emsbackend.repository.EmployeeRepository;
import com.employeesystem.emsbackend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Creates an employee and a USER account so they can log in with admin-provided credentials.
     */
    @Transactional
    public Employee createEmployeeWithAccount(EmployeeAccountRequest req) {
        if (req.getUsername() == null || req.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required for the employee login.");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required for the employee login.");
        }
        if (userRepository.existsByUsername(req.getUsername().trim())) {
            throw new RuntimeException("Username already exists.");
        }
        if (userRepository.existsByEmail(req.getEmail().trim())) {
            throw new RuntimeException("Email already registered to another account.");
        }

        User user = new User();
        user.setUsername(req.getUsername().trim());
        user.setEmail(req.getEmail().trim());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(Role.USER);
        userRepository.save(user);

        Employee employee = new Employee();
        employee.setFirstName(req.getFirstName());
        employee.setLastName(req.getLastName());
        employee.setEmail(req.getEmail().trim());
        employee.setUser(user);
        return employeeRepository.save(employee);
    }

    // Legacy path — prefer createEmployeeWithAccount
    public Employee addEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    // ✅ Fetch Employee by ID
    public Employee findEmployeeById(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee ID " + employeeId + " not found"));
    }

    // ✅ Fetch All Employees (Admin Only)
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // ✅ Fetch Employee by Username (For Users)
    public Employee findEmployeeByUsername(String username) {
        return employeeRepository.findByUser_Username(username);
    }

    // ✅ Update Employee (Admin Only)
    @Transactional
    public Employee updateEmployee(Long id, EmployeeAccountRequest req) {
        Employee emp = findEmployeeById(id);
        emp.setFirstName(req.getFirstName());
        emp.setLastName(req.getLastName());
        emp.setEmail(req.getEmail().trim());

        User user = emp.getUser();
        if (user != null) {
            user.setEmail(req.getEmail().trim());
            if (req.getPassword() != null && !req.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(req.getPassword()));
            }
            userRepository.save(user);
        }

        return employeeRepository.save(emp);
    }

    // ✅ Delete Employee (Admin Only)
    @Transactional
    public void deleteEmployeeById(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found ID " + id));
        User user = emp.getUser();
        employeeRepository.delete(emp);
        if (user != null) {
            userRepository.delete(user);
        }
    }

    public Employee findEmployeeByEmail(String email){
        return employeeRepository.findByEmail(email);
    }
}

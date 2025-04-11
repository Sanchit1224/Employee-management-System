package com.employeesystem.emsbackend.service;

import com.employeesystem.emsbackend.entity.Employee;
import com.employeesystem.emsbackend.entity.User;
import com.employeesystem.emsbackend.exception.ResourceNotFoundException;
import com.employeesystem.emsbackend.repository.EmployeeRepository;
import com.employeesystem.emsbackend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    // ✅ Create Employee (Must be linked to an existing user)
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
    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        Employee emp = findEmployeeById(id);
        emp.setFirstName(updatedEmployee.getFirstName());
        emp.setLastName(updatedEmployee.getLastName());
        emp.setEmail(updatedEmployee.getEmail());

        return employeeRepository.save(emp);
    }

    // ✅ Delete Employee (Admin Only)
    public void deleteEmployeeById(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found ID " + id);
        }
        employeeRepository.deleteById(id);
    }

    public Employee findEmployeeByEmail(String email){
        return employeeRepository.findByEmail(email);
    }
}

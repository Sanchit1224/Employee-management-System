package com.employeesystem.emsbackend.repository;

import com.employeesystem.emsbackend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // ✅ Find employee by associated user's username (for users viewing their own profile)
    Employee findByUser_Username(String username);

    // ✅ Find employee by associated user's email (used when linking an employee to a user)
    Employee findByEmail(String email);

    // ✅ Fetch all employees (Admin Only)
    List<Employee> findAll();
}

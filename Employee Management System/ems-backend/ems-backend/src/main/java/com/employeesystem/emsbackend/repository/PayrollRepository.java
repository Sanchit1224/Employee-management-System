package com.employeesystem.emsbackend.repository;

import com.employeesystem.emsbackend.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    Optional<Payroll> findByUserId(Long userId);
}

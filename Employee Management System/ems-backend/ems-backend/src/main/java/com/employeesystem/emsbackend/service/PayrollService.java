package com.employeesystem.emsbackend.service;

import com.employeesystem.emsbackend.entity.Payroll;
import com.employeesystem.emsbackend.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PayrollService {
    private final PayrollRepository payrollRepository;

    public Optional<Payroll> getPayrollByUserId(Long userId) {
        return payrollRepository.findByUserId(userId);
    }

    public Payroll savePayroll(Payroll payroll) {
        return payrollRepository.save(payroll);
    }
}

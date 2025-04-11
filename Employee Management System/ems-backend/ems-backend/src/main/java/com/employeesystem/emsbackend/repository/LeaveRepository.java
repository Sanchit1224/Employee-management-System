package com.employeesystem.emsbackend.repository;

import com.employeesystem.emsbackend.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {
}

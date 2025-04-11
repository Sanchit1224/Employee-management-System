package com.employeesystem.emsbackend.repository;

import com.employeesystem.emsbackend.entity.AttendanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceRequest, Long> {
    List<AttendanceRequest> findByUserId(Long userId); // 🔥 Fetch all records for a user
}

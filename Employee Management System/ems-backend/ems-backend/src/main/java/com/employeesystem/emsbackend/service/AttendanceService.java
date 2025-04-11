package com.employeesystem.emsbackend.service;

import com.employeesystem.emsbackend.entity.AttendanceRequest;
import com.employeesystem.emsbackend.entity.AttendanceStatus;
import com.employeesystem.emsbackend.entity.User;
import com.employeesystem.emsbackend.repository.AttendanceRepository;
import com.employeesystem.emsbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    public AttendanceRequest markAttendance(Long userId, AttendanceStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AttendanceRequest attendance = new AttendanceRequest();
        attendance.setUser(user);
        attendance.setTimestamp(LocalDateTime.now());
        attendance.setStatus(status);

        return attendanceRepository.save(attendance);
    }

    public List<AttendanceRequest> getAttendanceByUser(Long userId) {
        return attendanceRepository.findByUserId(userId);
    }
}

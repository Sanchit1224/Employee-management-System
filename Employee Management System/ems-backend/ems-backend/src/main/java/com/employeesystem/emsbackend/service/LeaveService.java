package com.employeesystem.emsbackend.service;

import com.employeesystem.emsbackend.entity.LeaveRequest;
import com.employeesystem.emsbackend.repository.LeaveRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class LeaveService {
    private final LeaveRepository leaveRepository;

    public void saveLeaveRequest(LeaveRequest leaveRequest) {
        leaveRepository.save(leaveRequest);
    }

    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRepository.findAll();
    }

    public void updateLeaveStatus(Long id, String status) {
        LeaveRequest leaveRequest = leaveRepository.findById(id).orElseThrow();
        leaveRequest.setStatus(status);
        leaveRepository.save(leaveRequest);
    }
}

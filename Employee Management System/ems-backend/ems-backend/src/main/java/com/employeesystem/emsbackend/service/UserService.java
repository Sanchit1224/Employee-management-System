package com.employeesystem.emsbackend.service;

import com.employeesystem.emsbackend.entity.Role;
import com.employeesystem.emsbackend.entity.User;
import com.employeesystem.emsbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor // ✅ Replaces explicit constructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 🔹 Register New User
    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername()) || userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("❌ Username or Email already exists!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword())); // 🔐 Hash password
        if (user.getRole() == null) {
            user.setRole(Role.USER); // Default role is USER
        }
        return userRepository.save(user);
    }

    // 🔹 Find User by Username
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username); // ✅ Return Optional<User>
    }

    // 🔹 Find User by Email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email); // ✅ Return Optional<User>
    }
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

}

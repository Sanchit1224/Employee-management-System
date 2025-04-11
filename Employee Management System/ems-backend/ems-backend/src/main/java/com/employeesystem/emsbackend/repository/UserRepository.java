package com.employeesystem.emsbackend.repository;

import com.employeesystem.emsbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username); // Find user by username

    Optional<User> findByEmail(String email); // Find user by email

    boolean existsByUsername(String username); // Check if username exists

    boolean existsByEmail(String email); // Check if email exists
}

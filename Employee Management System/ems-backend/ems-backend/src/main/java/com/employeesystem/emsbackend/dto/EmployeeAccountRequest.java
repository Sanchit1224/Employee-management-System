package com.employeesystem.emsbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeAccountRequest {
    private String firstName;
    private String lastName;
    private String email;
    /** Login username (required when creating an employee). */
    private String username;
    /** Plain password (required on create; optional on update to change password). */
    private String password;
}

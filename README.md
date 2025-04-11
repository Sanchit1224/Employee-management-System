# Employee-management-System
Employee Management System is a full-stack web application that allows users and administrators to manage employee data efficiently. It features separate User and Admin panels, with functionality to create, read, update, and delete employee records using a React.js frontend, Spring Boot backend, and MySQL database.

A full-stack Employee Management System built using **React.js** for the frontend, **Spring Boot** for the backend, and **MySQL** as the database. This project allows users to perform CRUD operations on employee records.

## Features

👤 User Panel
Mark attendance
Apply for leave
View payroll information

🛠️ Admin Panel
Approve or deny leave requests
Perform Restful Operations of Employee
Make Payroll

## Tech Stack

### Frontend
- React.js
- Axios (for API calls)
- Bootstrap / TailwindCSS (optional UI styling)

### Backend
- Spring Boot
- Spring Data JPA
- REST API

### Database
- MySQL


## Getting Started

### Prerequisites

- Node.js and npm
- Java JDK 17+ or 11+
- MySQL
- Maven

### Backend Setup

1. Clone the repository.
2. Import the backend folder in your IDE (e.g., IntelliJ, Eclipse).
3. Configure `application.properties` with your MySQL credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/employee_db
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update

![image](https://github.com/user-attachments/assets/4fd75291-3759-4b2f-8952-682c09937de3)



import axios from "axios";

const EMP_URL = "http://localhost:8080/api/emp";  // Base URL for employees
const LEAVE_URL = "http://localhost:8080/api/leave"; // Base URL for leave management

// Function to set Authorization headers
const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`, 
    "Content-Type": "application/json",
  },
});

// 🔥 Employee CRUD Operations
export const listEmployees = (token) => 
  axios.get(EMP_URL, { ...authHeader(token) })
    .catch(error => console.error("Error fetching employees:", error.response?.data || error.message));

export const savedEmployee = (employee, token) => 
  axios.post(EMP_URL, employee, { ...authHeader(token) })
    .catch(error => console.error("Error saving employee:", error.response?.data || error.message));

export const editEmployee = (employeeId, token) => 
  axios.get(`${EMP_URL}/${employeeId}`, { ...authHeader(token) })
    .catch(error => console.error("Error fetching employee details:", error.response?.data || error.message));

export const updateDataEmployee = (employeeId, employee, token) => 
  axios.put(`${EMP_URL}/${employeeId}`, employee, { ...authHeader(token) })
    .catch(error => console.error("Error updating employee:", error.response?.data || error.message));

export const deleteEmployee = (employeeId, token) => 
  axios.delete(`${EMP_URL}/${employeeId}`, { ...authHeader(token) })
    .catch(error => console.error("Error deleting employee:", error.response?.data || error.message));

// 🔥 Leave Management Operations

export const getLeaveRequests = (token) => 
  axios.get(`${LEAVE_URL}/requests`, { ...authHeader(token) })
     .catch(error => console.error("Error fetching leave requests:", error.response?.data || error.message)); 
 

export const applyLeave = (leaveRequest, token) => 
  axios.post(`${LEAVE_URL}/apply`, leaveRequest, { ...authHeader(token) })
    .catch(error => console.error("Error applying for leave:", error.response?.data || error.message));

export const approveLeave = (leaveId, token) => 
  axios.put(`${LEAVE_URL}/approve/${leaveId}`, {}, { ...authHeader(token) })
    .catch(error => console.error("Error approving leave:", error.response?.data || error.message));

export const denyLeave = (leaveId, token) => 
  axios.put(`${LEAVE_URL}/deny/${leaveId}`, {}, { ...authHeader(token) })
    .catch(error => console.error("Error denying leave:", error.response?.data || error.message));

import axios from "axios";

const USER_API = "http://localhost:8080/api/user";
const LEAVE_API = "http://localhost:8080/api";

// ✅ Function to set authorization headers
const authHeader = (token) => ({
  Authorization: `Bearer ${token}`, //  Fixed: No nested object
  "Content-Type": "application/json",
});

// ✅ Mark Attendance
export const markAttendance = async (token, userId, status = "PRESENT") => {
  try {
    const response = await axios.post(
      `${USER_API}/attendance`,
      { userId, status },
      { headers: authHeader(token) } //  Correct way to pass headers
    );
    return response.data;
  } catch (error) {
    console.error("Error marking attendance:", error.response?.data || error.message);
    throw error;
  }
};

export const getAttendanceHistory = async (token, userId) => {
  try {
    const response = await axios.get(
      `${USER_API}/attendance/${userId}`,
      { headers: authHeader(token) }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance history:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Apply for Leave
export const applyLeave = async (token,leaveRequest) => {
  try {
    const response = await axios.post(
      `${LEAVE_API}/leave/apply`,
       leaveRequest ,
      { headers: authHeader(token) } //  Correct way to pass headers
    );
    console.log("✅ Leave request successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error applying for leave:", error.response?.data || error.message);
    throw error;
  }
};

export const getMyLeaveRequests = async (token, userId) => {
  try {
    const response = await axios.get(
      `${LEAVE_API}/leave/my-requests/${userId}`,
      { headers: authHeader(token) }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching leave history:", error.response?.data || error.message);
    throw error;
  }
};

//  Get Payroll Details
export const getPayroll = async (token, userId) => {
  try {
    const response = await axios.get(
      `${USER_API}/payroll/${userId}`,
      { headers: authHeader(token) } // Correct way to pass headers
    );
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    console.error("Error fetching payroll details:", error.response?.data || error.message);
    throw error;
  }
};

// Create or update payroll (admin)
export const upsertPayroll = async (token, payrollData) => {
  try {
    const response = await axios.post(
      `${USER_API}/payroll/add`,
      payrollData,
      { headers: authHeader(token) }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving payroll:", error.response?.data || error.message);
    throw error;
  }
};

import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { applyLeave, markAttendance, getPayroll } from "../service/UserService";
import { toast } from "react-toastify";
import { FaBars, FaTachometerAlt, FaCalendarAlt, FaMoneyBill } from "react-icons/fa";
import "../style/userDashboard.css";

const UserDashboard = () => {
  const { user,logout } = useContext(AuthContext);
  const [selectedSection, setSelectedSection] = useState("dashboard");
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [payrollDetails, setPayrollDetails] = useState(null);
  const [leaveReason, setLeaveReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingPayroll, setLoadingPayroll] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (user) {
      getPayroll(user.token, user.userId)
        .then((data) => {
          setPayrollDetails(data);
          setLoadingPayroll(false);
        })
        .catch(() => {
         // toast.error("Failed to load payroll details!");
          setLoadingPayroll(false);
        });
    }
  }, [user]);


  const handleAttendance = () => {
    const userKey = `lastAttendanceTime_${user.userId}`;
    const lastMarkedTime = localStorage.getItem(userKey);
    const now = new Date().getTime();

    if (lastMarkedTime) {
      const hoursPassed = (now - parseInt(lastMarkedTime)) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        toast.warning(`You can mark attendance again after ${Math.ceil(24 - hoursPassed)} hours.`);
        return;
      }
    }

    markAttendance(user.token, user.userId)
      .then(() => {
        setAttendanceMarked(true);
        localStorage.setItem(userKey, now);
        toast.success("Attendance marked successfully!");
      })
      .catch(() => toast.error("Failed to mark attendance!"));
  };

  const handleLeaveApplication = () => {
    if (!leaveReason.trim() || !startDate || !endDate) {
      toast.warning(" Please fill in all fields!");
      return;
    }

    const leaveRequest = {
      userId: user.userId,
      reason: leaveReason,
      startDate: startDate,
      endDate: endDate,
    };

    applyLeave(user.token, leaveRequest)
      .then(() => {
        toast.success("Leave request submitted!");
        setLeaveReason("");
        setStartDate("");
        setEndDate("");
      })
      .catch(() => toast.error("Failed to submit leave request!"));
  };

  return (
    <div className="dashboard-container">
      {/* ✅ Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <FaBars />
        </button>
        <ul>
          <li className={selectedSection === "dashboard" ? "active" : ""} onClick={() => setSelectedSection("dashboard")}>
            <FaTachometerAlt className="icon" /> Dashboard
          </li>
          <li className={selectedSection === "leaves" ? "active" : ""} onClick={() => setSelectedSection("leaves")}>
            <FaCalendarAlt className="icon" /> Leaves
          </li>
          <li className={selectedSection === "payroll" ? "active" : ""} onClick={() => setSelectedSection("payroll")}>
            <FaMoneyBill className="icon" /> Payroll
          </li>
        </ul>
      </div>

      {/* ✅ Main Content */}
      <div className={`content ${isSidebarOpen ? "content-adjusted" : ""}`}>
        {selectedSection === "dashboard" && (
          <div className="container mt-5">
            <div className="card shadow-lg p-4 mb-5 bg-light rounded">
              <div className="card-body">
                <h2 className="text-center text-dark mb-4">👋 Welcome, {user?.username}!</h2>
                <div className="text-center mb-4">
                  <button
                    className={`btn ${attendanceMarked ? "btn-success" : "btn-outline-primary"} w-50`}
                    onClick={handleAttendance}
                    disabled={attendanceMarked}
                  >
                    {attendanceMarked ? "✅ Attendance Marked" : "📅 Mark Attendance"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedSection === "leaves" && (
          <div className="card shadow-sm p-3 mb-4 bg-white rounded">
            <div className="card-body">
              <h3 className="card-title text-center text-primary">📝 Apply for Leave</h3>
              <div className="mb-3">
                <label className="form-label fw-bold">Start Date:</label>
                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">End Date:</label>
                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Leave Reason:</label>
                <textarea className="form-control" rows="3" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="Enter leave reason..." required></textarea>
              </div>
              <button className="btn btn-primary w-100" onClick={handleLeaveApplication}>
                📤 Submit Leave Request
              </button>
            </div>
          </div>
        )}

        {selectedSection === "payroll" && (
          <div className="card shadow-sm p-3 bg-white rounded">
            <div className="card-body">
              <h3 className="card-title text-center text-success">💰 Payroll Details</h3>
              {loadingPayroll ? (
                <p className="text-center text-secondary">Loading payroll...</p>
              ) : payrollDetails ? (
                <p className="text-center fw-bold fs-5">Salary: ₹{payrollDetails.salary}</p>
              ) : (
                <p className="text-center text-danger">No payroll data available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

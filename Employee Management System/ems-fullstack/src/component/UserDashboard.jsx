import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import {
  applyLeave,
  markAttendance,
  getPayroll,
  getMyLeaveRequests,
  getAttendanceHistory
} from "../service/UserService";
import { toast } from "react-toastify";
import { FaBars, FaTachometerAlt, FaCalendarAlt, FaMoneyBill, FaClipboardList, FaBell } from "react-icons/fa";
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
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (user) {
      const storedNotifications = localStorage.getItem(`notifications_${user.userId}`);
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }

      getPayroll(user.token, user.userId)
        .then((data) => {
          setPayrollDetails(data);
          setLoadingPayroll(false);
          addNotification("Payroll details loaded successfully.", "info");
        })
        .catch(() => {
         // toast.error("Failed to load payroll details!");
          setLoadingPayroll(false);
          addNotification("Payroll details are not available yet.", "warning");
        });

      fetchLeaveHistory();
      fetchAttendanceHistory();
    }
  }, [user]);

  const addNotification = (message, type = "info") => {
    if (!user?.userId) return;
    const newNotification = {
      id: Date.now(),
      message,
      type,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, 25);
      localStorage.setItem(`notifications_${user.userId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const fetchLeaveHistory = () => {
    getMyLeaveRequests(user.token, user.userId)
      .then((data) => setLeaveHistory(data))
      .catch(() => setLeaveHistory([]));
  };

  const fetchAttendanceHistory = () => {
    getAttendanceHistory(user.token, user.userId)
      .then((data) => {
        if (Array.isArray(data)) {
          setAttendanceHistory(data);
        } else {
          setAttendanceHistory([]);
        }
      })
      .catch(() => setAttendanceHistory([]));
  };


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
        addNotification("Attendance marked successfully.", "success");
        fetchAttendanceHistory();
      })
      .catch(() => {
        toast.error("Failed to mark attendance!");
        addNotification("Attendance marking failed.", "error");
      });
  };

  const handleLeaveApplication = () => {
    if (!leaveReason.trim() || !startDate || !endDate) {
      toast.warning("Please fill in all leave fields.");
      return;
    }

    if (leaveReason.trim().length < 5) {
      toast.warning("Leave reason should be at least 5 characters.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.warning("End date cannot be earlier than start date.");
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
        addNotification("Leave request submitted for approval.", "info");
        setLeaveReason("");
        setStartDate("");
        setEndDate("");
        fetchLeaveHistory();
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          (typeof error?.response?.data === "string" ? error.response.data : null) ||
          "Failed to submit leave request.";
        toast.error(message);
        addNotification("Leave request submission failed.", "error");
      });
  };

  const getLeaveStatusClass = (status) => {
    if (status === "APPROVED") return "bg-success";
    if (status === "DENIED") return "bg-danger";
    return "bg-warning text-dark";
  };

  const filteredAttendance = attendanceHistory.filter((record) => {
    if (!record?.timestamp) return false;
    return record.timestamp.slice(0, 7) === selectedMonth;
  });

  const attendanceSummary = filteredAttendance.reduce(
    (acc, record) => {
      const status = record?.status;
      if (status === "PRESENT") acc.present += 1;
      if (status === "ABSENT") acc.absent += 1;
      return acc;
    },
    { present: 0, absent: 0 }
  );

  const clearNotifications = () => {
    if (!user?.userId) return;
    setNotifications([]);
    localStorage.removeItem(`notifications_${user.userId}`);
  };

  const notificationBadgeClass = (type) => {
    if (type === "success") return "bg-success";
    if (type === "error") return "bg-danger";
    if (type === "warning") return "bg-warning text-dark";
    return "bg-info text-dark";
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
          <li className={selectedSection === "attendance" ? "active" : ""} onClick={() => setSelectedSection("attendance")}>
            <FaClipboardList className="icon" /> Attendance
          </li>
          <li className={selectedSection === "notifications" ? "active" : ""} onClick={() => setSelectedSection("notifications")}>
            <FaBell className="icon" /> Notifications
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
          <>
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

            <div className="card shadow-sm p-3 mb-4 bg-white rounded">
              <div className="card-body">
                <h3 className="card-title text-center text-secondary">📜 Leave History</h3>
                {leaveHistory.length === 0 ? (
                  <p className="text-center text-muted mb-0">No leave requests yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered align-middle mb-0">
                      <thead>
                        <tr className="text-center">
                          <th>From</th>
                          <th>To</th>
                          <th>Reason</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveHistory.map((leave) => (
                          <tr key={leave.id}>
                            <td className="text-center">{leave.startDate}</td>
                            <td className="text-center">{leave.endDate}</td>
                            <td>{leave.reason}</td>
                            <td className="text-center">
                              <span className={`badge ${getLeaveStatusClass(leave.status)}`}>
                                {leave.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
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

        {selectedSection === "attendance" && (
          <div className="card shadow-sm p-3 bg-white rounded">
            <div className="card-body">
              <h3 className="card-title text-center text-info">Attendance Report</h3>
              <div className="row g-2 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Month</label>
                  <input
                    type="month"
                    className="form-control"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
                <div className="col-md-8 d-flex align-items-end gap-3">
                  <span className="badge bg-success fs-6">Present: {attendanceSummary.present}</span>
                  <span className="badge bg-danger fs-6">Absent: {attendanceSummary.absent}</span>
                  <span className="badge bg-secondary fs-6">Total: {filteredAttendance.length}</span>
                </div>
              </div>

              {filteredAttendance.length === 0 ? (
                <p className="text-center text-muted mb-0">No attendance records found for this month.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-bordered mb-0">
                    <thead>
                      <tr className="text-center">
                        <th>Date/Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendance.map((record) => (
                        <tr key={record.id}>
                          <td className="text-center">{new Date(record.timestamp).toLocaleString()}</td>
                          <td className="text-center">
                            <span className={`badge ${record.status === "PRESENT" ? "bg-success" : "bg-danger"}`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedSection === "notifications" && (
          <div className="card shadow-sm p-3 bg-white rounded">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="card-title text-center text-primary mb-0">Notifications</h3>
                <button className="btn btn-outline-danger btn-sm" onClick={clearNotifications}>
                  Clear All
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-center text-muted mb-0">No notifications yet.</p>
              ) : (
                <ul className="list-group">
                  {notifications.map((item) => (
                    <li
                      key={item.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div>{item.message}</div>
                        <small className="text-muted">
                          {new Date(item.createdAt).toLocaleString()}
                        </small>
                      </div>
                      <span className={`badge ${notificationBadgeClass(item.type)}`}>
                        {item.type.toUpperCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

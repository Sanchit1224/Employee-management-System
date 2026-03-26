import React, { useState, useEffect, useContext } from "react";
import { listEmployees, getLeaveRequests, approveLeave, denyLeave } from "../service/EmployeeService";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaBars, FaTachometerAlt, FaUsers, FaCalendarCheck } from "react-icons/fa";
import "../style/userDashboard.css";

const ManagerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [selectedSection, setSelectedSection] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEmployees();
      fetchLeaveRequests();
    }
  }, [user]);

  function fetchEmployees() {
    listEmployees(user.token)
      .then((response) => setEmployees(response.data))
      .catch((error) => {
        console.error("Error fetching employees:", error);
        toast.error(error?.response?.data?.message || "Access denied while loading employees.");
      });
  }

  function fetchLeaveRequests() {
    getLeaveRequests(user.token)
      .then((response) => {
        const sortedRequests = response.data.sort((a, b) =>
          a.status === "PENDING" ? -1 : 1
        );
        setLeaveRequests(sortedRequests);
      })
      .catch((error) => {
        console.error("Error fetching leave requests:", error);
        toast.error(error?.response?.data?.message || "Access denied while loading leave requests.");
      });
  }

  function handleApproveLeave(id) {
    approveLeave(id, user.token)
      .then(() => {
        toast.success("Leave approved successfully!");
        setLeaveRequests((prevRequests) => prevRequests.filter((req) => req.id !== id));
      })
      .catch((error) => toast.error("Error approving leave:", error.message));
  }

  function handleDenyLeave(id) {
    denyLeave(id, user.token)
      .then(() => {
        toast.warning("Leave request denied.");
        setLeaveRequests((prevRequests) => prevRequests.filter((req) => req.id !== id));
      })
      .catch((error) => toast.error("Error denying leave:", error.message));
  }

  const filteredEmployees = employees
    .filter((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const email = emp.email.toLowerCase();
      const keyword = searchTerm.toLowerCase();
      return fullName.includes(keyword) || email.includes(keyword);
    })
    .sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB);
      }
      return nameB.localeCompare(nameA);
    });

  const pendingLeaveCount = leaveRequests.filter((leave) => leave.status === "PENDING").length;
  const getLeaveStatusClass = (status) => {
    if (status === "APPROVED") return "bg-success";
    if (status === "DENIED") return "bg-danger";
    return "bg-warning text-dark";
  };

  return (
    <div className="dashboard-container">
      {/* ✅ Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <FaBars />
        </button>
        <ul>
          <li
            className={selectedSection === "dashboard" ? "active" : ""}
            onClick={() => setSelectedSection("dashboard")}
          >
            <FaTachometerAlt className="icon" /> Dashboard
          </li>
          <li
            className={selectedSection === "employees" ? "active" : ""}
            onClick={() => setSelectedSection("employees")}
          >
            <FaUsers className="icon" /> Employees
          </li>
          <li
            className={selectedSection === "leaves" ? "active" : ""}
            onClick={() => setSelectedSection("leaves")}
          >
            <FaCalendarCheck className="icon" /> Leave Requests
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
                <p className="text-center text-muted mb-4">Manager Dashboard</p>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card border-primary shadow-sm">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-1">Team Size</h6>
                        <h3 className="mb-0 text-primary">{employees.length}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-warning shadow-sm">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-1">Pending Leave Requests</h6>
                        <h3 className="mb-0 text-warning">{pendingLeaveCount}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedSection === "employees" && (
          <div className="container mt-4">
            <div className="card shadow-sm p-3 bg-white rounded">
              <div className="card-body">
                <h3 className="card-title text-center text-primary mb-4">👥 Team Members</h3>

                <div className="row g-2 mb-3">
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="asc">Sort A-Z</option>
                      <option value="desc">Sort Z-A</option>
                    </select>
                  </div>
                </div>

                {filteredEmployees.length === 0 ? (
                  <p className="text-center text-muted">No employees found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered align-middle mb-0">
                      <thead className="table-dark">
                        <tr className="text-center">
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((emp) => (
                          <tr key={emp.id}>
                            <td>{emp.firstName}</td>
                            <td>{emp.lastName}</td>
                            <td>{emp.email}</td>
                            <td className="text-center">
                              <span className="badge bg-info">{emp.role}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedSection === "leaves" && (
          <div className="container mt-4">
            <div className="card shadow-sm p-3 bg-white rounded">
              <div className="card-body">
                <h3 className="card-title text-center text-primary mb-4">📋 Leave Requests</h3>

                {leaveRequests.length === 0 ? (
                  <p className="text-center text-muted">No leave requests available.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered align-middle mb-0">
                      <thead className="table-dark">
                        <tr className="text-center">
                          <th>Employee</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveRequests.map((leave) => (
                          <tr key={leave.id}>
                            <td>{leave.userName}</td>
                            <td className="text-center">{leave.startDate}</td>
                            <td className="text-center">{leave.endDate}</td>
                            <td>{leave.reason}</td>
                            <td className="text-center">
                              <span className={`badge ${getLeaveStatusClass(leave.status)}`}>
                                {leave.status}
                              </span>
                            </td>
                            <td className="text-center">
                              {leave.status === "PENDING" && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success me-2"
                                    onClick={() => handleApproveLeave(leave.id)}
                                  >
                                    ✅ Approve
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDenyLeave(leave.id)}
                                  >
                                    ❌ Deny
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;

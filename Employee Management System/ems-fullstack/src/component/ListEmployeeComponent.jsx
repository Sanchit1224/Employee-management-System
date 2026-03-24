import React, { useState, useEffect, useContext } from "react";
import { listEmployees, deleteEmployee, getLeaveRequests, approveLeave, denyLeave, getAuditLogs, listUsers } from "../service/EmployeeService";
import { upsertPayroll } from "../service/UserService";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";

function ListEmployeeComponent() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === "ADMIN";
    const isManager = user?.role === "MANAGER";
    
    const [employees, setEmployees] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [auditLogs, setAuditLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [payrollForm, setPayrollForm] = useState({
        userId: "",
        salary: "",
        payPeriod: ""
    });

    

    useEffect(() => {
        if (isAdmin || isManager) {
            fetchEmployees();
            fetchLeaveRequests();
            if (isAdmin) {
                fetchAuditLogs();
                fetchUsers();
            }
        } else {
            navigate("/user");
        }
    }, [isAdmin, isManager, navigate, user]);

    function fetchEmployees() {
        listEmployees(user.token)
            .then(response => {setEmployees(response.data)})
            .catch(error =>{
                console.error("Error fetching employees:", error);
                toast.error(error?.response?.data?.message || "Access denied while loading employees.");
            });
    }

    function fetchLeaveRequests() {
        getLeaveRequests(user.token)
            .then(response => {
                // Sort: Pending requests on top, others below
                const sortedRequests = response.data.sort((a, b) => 
                    a.status === "PENDING" ? -1 : 1
                );
                setLeaveRequests(sortedRequests);
            })
            .catch(error => {
                console.error("Error fetching leave requests:", error);
                toast.error(error?.response?.data?.message || "Access denied while loading leave requests.");
            });
    }

    function fetchAuditLogs() {
        getAuditLogs(user.token)
            .then(response => setAuditLogs(response.data || []))
            .catch(error => {
                console.error("Error fetching audit logs:", error);
                toast.error(error?.response?.data?.message || "Access denied while loading audit logs.");
            });
    }

    function fetchUsers() {
        listUsers(user.token)
            .then(response => {
                const payrollUsers = (response.data || []).filter(u => u.role === "USER");
                setUsers(payrollUsers);
            })
            .catch(error => {
                console.error("Error fetching users:", error);
                toast.error(error?.response?.data?.message || "Failed to load users for payroll.");
            });
    }
    

    function handleApproveLeave(id) {
        approveLeave(id, user.token)
            .then(() => {
               // fetchLeaveRequests();
                toast.success("Leave approved successfully!");
                setLeaveRequests(prevRequests => prevRequests.filter(req => req.id !== id));
                if (isAdmin) {
                    fetchAuditLogs();
                }
            })
            .catch(error => toast.error("Error approving leave:", error.message));
    }

    function handleDenyLeave(id) {
        denyLeave(id, user.token)
            .then(() => {
                //fetchLeaveRequests();
                toast.warn("Leave request denied.");
                setLeaveRequests(prevRequests => prevRequests.filter(req => req.id !== id));
                if (isAdmin) {
                    fetchAuditLogs();
                }
            })
            .catch(error => toast.error("Error denying leave:", error.message));
    }

    function addNewEmployee() {
        navigate('/add-employee');
        
    }

    function updateEmployee(id) {
        navigate(`/update-employee/${id}`);
    }

    function setPayrollForEmployee(emp) {
        const matchedUser = users.find(
            (u) =>
                u.email?.toLowerCase() === emp.email?.toLowerCase() ||
                u.username?.toLowerCase() === emp.firstName?.toLowerCase()
        );

        if (!matchedUser) {
            toast.warning("No linked user found for this employee. Select user manually in payroll form.");
            return;
        }

        setPayrollForm((prev) => ({ ...prev, userId: String(matchedUser.id) }));
        toast.info(`Payroll form prefilled for ${matchedUser.username}.`);
    }

    function deleteEmployeeHandler(id) {
        deleteEmployee(id, user.token)
            .then(() => {
                toast.success("Employee deleted successfully!");
                fetchEmployees();
                if (isAdmin) {
                    fetchAuditLogs();
                }
            })
            .catch(error => toast.error("Error deleting employee:", error.message));
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
    const recentEmployeeRecords = [...employees]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    function handlePayrollChange(e) {
        const { name, value } = e.target;
        setPayrollForm(prev => ({ ...prev, [name]: value }));
    }

    async function handlePayrollSubmit(e) {
        e.preventDefault();

        if (!payrollForm.userId || !payrollForm.salary || !payrollForm.payPeriod) {
            toast.error("Please fill all payroll fields.");
            return;
        }

        try {
            await upsertPayroll(user.token, {
                user: { id: Number(payrollForm.userId) },
                salary: Number(payrollForm.salary),
                payPeriod: payrollForm.payPeriod
            });
            toast.success("Payroll saved successfully.");
            setPayrollForm({ userId: "", salary: "", payPeriod: "" });
            if (isAdmin) {
                fetchAuditLogs();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save payroll.");
        }
    }

    return (
        <div className="container">
            <h3 className="text-center mt-3">
                {isAdmin ? "Admin Panel - Employee Management" : "Manager Panel - Employee Overview"}
            </h3>

            {isManager && (
                <div className="row g-3 my-2">
                    <div className="col-md-4">
                        <div className="card border-primary shadow-sm">
                            <div className="card-body text-center">
                                <h6 className="text-muted mb-1">Team Size</h6>
                                <h3 className="mb-0">{employees.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-warning shadow-sm">
                            <div className="card-body text-center">
                                <h6 className="text-muted mb-1">Pending Leaves</h6>
                                <h3 className="mb-0">{pendingLeaveCount}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-success shadow-sm">
                            <div className="card-body text-center">
                                <h6 className="text-muted mb-1">Recent Joiners (Records)</h6>
                                <h3 className="mb-0">{recentEmployeeRecords.length}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {isAdmin && (
                <button className="btn btn-primary mb-2" onClick={addNewEmployee}>Add Employee</button>
            )}

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
                        <option value="asc">Sort by Name (A-Z)</option>
                        <option value="desc">Sort by Name (Z-A)</option>
                    </select>
                </div>
            </div>
            
            <table className="table table-success table-striped table-bordered table-hover">
                <thead>
                    <tr className="text-center">
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        {isAdmin && <th>Payroll</th>}
                        {isAdmin && <th>Update</th>}
                        {isAdmin && <th>Delete</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredEmployees.map(emp => (
                        <tr key={emp.id} className="text-center">
                            <td>{emp.id}</td>
                            <td>{emp.firstName}</td>
                            <td>{emp.lastName}</td>
                            <td>{emp.email}</td>
                            {isAdmin && (
                                <td>
                                    <button className="btn btn-outline-primary" onClick={() => setPayrollForEmployee(emp)}>
                                        Set Payroll
                                    </button>
                                </td>
                            )}
                            {isAdmin && (
                                <td>
                                    <button className="btn btn-success" onClick={() => updateEmployee(emp.id)}>Update</button>
                                </td>
                            )}
                            {isAdmin && (
                                <td>
                                    <button className="btn btn-danger" onClick={() => deleteEmployeeHandler(emp.id)}>Delete</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {isManager && (
                <>
                    <h3 className="text-center mt-4">Recent Employee Records</h3>
                    <table className="table table-light table-striped table-bordered table-hover">
                        <thead>
                            <tr className="text-center">
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentEmployeeRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center">No employee records found.</td>
                                </tr>
                            ) : (
                                recentEmployeeRecords.map((emp) => (
                                    <tr key={emp.id}>
                                        <td className="text-center">{emp.id}</td>
                                        <td>{emp.firstName} {emp.lastName}</td>
                                        <td>{emp.email}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </>
            )}

            <h3 className="text-center mt-4">Pending Leave Requests</h3>
            <table className="table table-warning table-striped table-bordered table-hover">
                <thead>
                    <tr className="text-center">
                        <th>ID</th>
                        <th>Employee</th>
                        <th>Reason</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        {isAdmin && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {leaveRequests.map(leave => (
                        <tr key={leave.id} className="text-center">
                            <td>{leave.id}</td>
                            <td>{leave.user ? leave.user.username : "Unknown"}</td>
                            <td>{leave.reason}</td>
                            <td>{leave.startDate}</td>
                            <td>{leave.endDate}</td>
                            <td>{leave.status}</td>
                            {isAdmin && (
                                <td>
                                    {leave.status === "PENDING" && (
                                        <>
                                            <button className="btn btn-success me-2" onClick={() => handleApproveLeave(leave.id)}>Approve</button>
                                            <button className="btn btn-danger" onClick={() => handleDenyLeave(leave.id)}>Deny</button>
                                        </>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {isAdmin && (
            <>
            <h3 className="text-center mt-4">Payroll Management</h3>
            <form className="card p-3 mb-4" onSubmit={handlePayrollSubmit}>
                <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <label className="form-label">User</label>
                        <select
                            className="form-select"
                            name="userId"
                            value={payrollForm.userId}
                            onChange={handlePayrollChange}
                            required
                        >
                            <option value="">Select employee user</option>
                            {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.username} ({u.email}) - User ID: {u.id}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Salary</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control"
                            name="salary"
                            value={payrollForm.salary}
                            onChange={handlePayrollChange}
                            placeholder="Enter salary"
                            required
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Pay Period</label>
                        <input
                            type="text"
                            className="form-control"
                            name="payPeriod"
                            value={payrollForm.payPeriod}
                            onChange={handlePayrollChange}
                            placeholder="e.g., March 2026"
                            required
                        />
                    </div>
                    <div className="col-md-2 d-grid">
                        <button type="submit" className="btn btn-primary">
                            Save Payroll
                        </button>
                    </div>
                </div>
            </form>
            </>
            )}

            {isAdmin && (
            <>
            <h3 className="text-center mt-4">Audit Logs</h3>
            <div className="table-responsive mb-4">
                <table className="table table-dark table-striped table-bordered table-hover">
                    <thead>
                        <tr className="text-center">
                            <th>Time</th>
                            <th>Action</th>
                            <th>Performed By</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditLogs.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">No audit logs available.</td>
                            </tr>
                        ) : (
                            auditLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="text-center">{new Date(log.createdAt).toLocaleString()}</td>
                                    <td className="text-center">{log.action}</td>
                                    <td className="text-center">{log.performedBy}</td>
                                    <td>{log.details}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            </>
            )}
        </div>
    );
}

export default ListEmployeeComponent;
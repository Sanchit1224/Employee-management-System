import React, { useState, useEffect, useContext } from "react";
import { listEmployees, deleteEmployee, getLeaveRequests, approveLeave, denyLeave } from "../service/EmployeeService";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";

function ListEmployeeComponent() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [employees, setEmployees] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);

    

    useEffect(() => {
        if (user?.role === "ADMIN") {
            fetchEmployees();
            fetchLeaveRequests();
        } else {
            navigate("/user"); // Redirect non-admins to user panel
        }
    }, [user, navigate]);

    function fetchEmployees() {
        listEmployees(user.token)
            .then(response => {setEmployees(response.data)})
            .catch(error =>{ console.error("Error fetching employees:", error)});
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
            .catch(error => console.error("Error fetching leave requests:", error));
    }
    

    function handleApproveLeave(id) {
        approveLeave(id, user.token)
            .then(() => {
               // fetchLeaveRequests();
                toast.success("Leave approved successfully!");
                setLeaveRequests(prevRequests => prevRequests.filter(req => req.id !== id));
            })
            .catch(error => toast.error("Error approving leave:", error.message));
    }

    function handleDenyLeave(id) {
        denyLeave(id, user.token)
            .then(() => {
                //fetchLeaveRequests();
                toast.warn("Leave request denied.");
                setLeaveRequests(prevRequests => prevRequests.filter(req => req.id !== id));
            })
            .catch(error => toast.error("Error denying leave:", error.message));
    }

    function addNewEmployee() {
        navigate('/add-employee');
        
    }

    function updateEmployee(id) {
        navigate(`/update-employee/${id}`);
    }

    function deleteEmployeeHandler(id) {
        deleteEmployee(id)
            .then(() => {
                toast.success("Employee deleted successfully!");
                fetchEmployees();
            })
            .catch(error => toast.error("Error deleting employee:", error.message));
    }

    return (
        <div className="container">
            <h3 className="text-center mt-3">Admin Panel - Employee Management</h3>
            
            <button className="btn btn-primary mb-2" onClick={addNewEmployee}>Add Employee</button>
            
            <table className="table table-success table-striped table-bordered table-hover">
                <thead>
                    <tr className="text-center">
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Update</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(emp => (
                        <tr key={emp.id} className="text-center">
                            <td>{emp.id}</td>
                            <td>{emp.firstName}</td>
                            <td>{emp.lastName}</td>
                            <td>{emp.email}</td>
                            <td>
                                <button className="btn btn-success" onClick={() => updateEmployee(emp.id)}>Update</button>
                            </td>
                            <td>
                                <button className="btn btn-danger" onClick={() => deleteEmployeeHandler(emp.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
                        <th>Actions</th>
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
                            <td>
                                {leave.status === "PENDING" && (
                                    <>
                                        <button className="btn btn-success me-2" onClick={() => handleApproveLeave(leave.id)}>Approve</button>
                                        <button className="btn btn-danger" onClick={() => handleDenyLeave(leave.id)}>Deny</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ListEmployeeComponent;
import React, { useState, useEffect, useContext } from "react";
import {
  savedEmployee,
  updateDataEmployee,
  editEmployee,
} from "../service/EmployeeService";
import "../style/employeeform.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";

function EmployeeComponent() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "Password123",
    role: "USER",
  });

  useEffect(() => {
    if (!user || !user.token) {
      navigate("/login");
    } else if (user.role !== "ADMIN") {
      navigate("/user");
    }

    if (id) {
      editEmployee(id, user.token)
        .then((response) => setEmployee(response.data))
        .catch((error) => console.error("Error fetching employee:", error));
    }
  }, [id, user, navigate]);

  function handleChange(e) {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!employee.firstName.trim()) {
      alert("First name is required!");
      return;
    }

    if (!employee.lastName.trim()) {
      alert("Last name is required!");
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(employee.email)) {
      alert("Enter a valid Gmail address!");
      return;
    }

    saveEmployee();
  };

  function saveEmployee(e) {
    const updatedEmployee = {
      ...employee,
      username: employee.firstName,
      password: employee.password || "Password123",
      role: employee.role || "USER",
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
    };

    if (id) {
      updateDataEmployee(id, updatedEmployee, user.token)
        .then(() => {
          toast.success("Employee updated successfully!");
          navigate("/admin");
        })
        .catch((error) => {
          toast.error("Failed to update employee.");
          console.error(error);
        });
    } else {
      savedEmployee(updatedEmployee, user.token)
        .then(() => {
          toast.success("Employee added successfully!");
          navigate("/admin");
        })
        .catch((error) => {
          toast.error("Failed to add employee.");
          console.error(error);
        });
    }
  }

  return (
    <div className="st-ba">
      <div className="container d-flex justify-content-center align-items-center">
        <div className="text-center card card-top">
          <div className="card-head">
            <h4 className="title">{id ? "Update Employee" : "Add Employee"}</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter First Name"
                  value={employee.firstName}
                  className="form-control"
                  onChange={handleChange}
                  required
                />
                {!employee.firstName.trim() && (
                  <small className="text-danger">First name is required.</small>
                )}
              </div>

              <div className="form-group mb-3">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter Last Name"
                  value={employee.lastName}
                  className="form-control"
                  onChange={handleChange}
                  required
                />
                {!employee.lastName.trim() && (
                  <small className="text-danger">Last name is required.</small>
                )}
              </div>

              <div className="form-group mb-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  value={employee.email}
                  className="form-control"
                  onChange={handleChange}
                  required
                />
                {!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(employee.email) &&
                  employee.email && (
                    <small className="text-danger">
                      Enter a valid Gmail address.
                    </small>
                  )}
              </div>

              <div className="form-group mb-3">
                <select
                  name="role"
                  className="form-control"
                  value={employee.role}
                  onChange={handleChange}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <button type="submit" className="btn btn-success">
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeComponent;

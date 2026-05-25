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
    password: "",
  });

  useEffect(() => {
    if (!user || !user.token) {
      navigate("/login");
    } else if (user.role !== "ADMIN") {
      navigate("/user");
    }

    if (id) {
      editEmployee(id, user.token)
        .then((response) => {
          const data = response.data;
          setEmployee({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            username: data.user?.username || "",
            password: "",
          });
        })
        .catch((error) => console.error("Error fetching employee:", error));
    }
  }, [id, user, navigate]);

  function handleChange(e) {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!employee.firstName.trim()) {
      toast.warning("First name is required.");
      return;
    }

    if (!employee.lastName.trim()) {
      toast.warning("Last name is required.");
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(employee.email)) {
      toast.warning("Enter a valid email address.");
      return;
    }

    if (!id) {
      if (!employee.username.trim()) {
        toast.warning("Username is required for the employee login.");
        return;
      }
      if (!employee.password || employee.password.length < 6) {
        toast.warning("Password must be at least 6 characters.");
        return;
      }
    }

    saveEmployee();
  };

  function saveEmployee() {
    const payload = {
      firstName: employee.firstName.trim(),
      lastName: employee.lastName.trim(),
      email: employee.email.trim(),
      username: employee.username.trim(),
      password: employee.password,
    };

    if (id) {
      const updatePayload = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
      };
      if (employee.password.trim()) {
        updatePayload.password = employee.password;
      }
      updateDataEmployee(id, updatePayload, user.token)
        .then(() => {
          toast.success("Employee updated successfully!");
          navigate("/admin");
        })
        .catch((error) => {
          const message =
            error?.response?.data?.message ||
            (typeof error?.response?.data === "string" ? error.response.data : null) ||
            "Failed to update employee.";
          toast.error(message);
          console.error(error);
        });
    } else {
      savedEmployee(payload, user.token)
        .then(() => {
          toast.success("Employee and login created. They can sign in with the username and password you set.");
          navigate("/admin");
        })
        .catch((error) => {
          const message =
            error?.response?.data?.message ||
            (typeof error?.response?.data === "string" ? error.response.data : null) ||
            "Failed to add employee.";
          toast.error(message);
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
                {!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(employee.email) &&
                  employee.email && (
                    <small className="text-danger">
                      Enter a valid email address.
                    </small>
                  )}
              </div>

              {!id ? (
                <>
                  <div className="form-group mb-3">
                    <label className="form-label text-start d-block">Login username</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Employee will use this to sign in"
                      value={employee.username}
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label text-start d-block">Initial password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Share this securely with the employee"
                      value={employee.password}
                      className="form-control"
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group mb-3">
                    <label className="form-label text-start d-block">Login username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={employee.username}
                      disabled
                    />
                    <small className="text-muted">Username cannot be changed here.</small>
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label text-start d-block">New password (optional)</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Leave blank to keep current password"
                      value={employee.password}
                      className="form-control"
                      onChange={handleChange}
                      minLength={6}
                    />
                  </div>
                </>
              )}

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

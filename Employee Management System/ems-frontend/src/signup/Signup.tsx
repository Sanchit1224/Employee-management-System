import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { FaSignInAlt } from "react-icons/fa";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "MANAGER",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", formData);
      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
          ? String((err.response as { data?: unknown }).data)
          : "Registration failed. Please try again.";
      toast.error(message);
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="addUser">
      <h3>Sign Up</h3>
      <form className="addUserForm" onSubmit={handleSubmit}>
        <div className="inputGroup">
          <label htmlFor="username">Username:</label>
          <input type="text" name="username" onChange={handleChange} required />

          <label htmlFor="email">Email:</label>
          <input type="email" name="email" onChange={handleChange} required />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            required
          />

          <label htmlFor="role">Register as:</label>
          <select
            id="role"
            name="role"
            className="form-select mb-2"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
          <p className="small text-muted mb-2">
            Employee accounts are not self-registered. An administrator creates each employee (and their login) from Add Employee.
          </p>

          <button type="submit" className="btn btn-dark">
            SignUp
          </button>
        </div>
      </form>
      <p>
      <div className="login">
      <p>Already have an Account?</p>
        <Link className="navbar-brand navi" to="/login">
          <FaSignInAlt className="me-1" /> Login
        </Link>
        </div>
      </p>
    </div>
  );
};

export default Signup;

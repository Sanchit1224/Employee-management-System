import React, { useState, useContext } from "react";
import "../login/login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Use axios directly instead of `../api/axios`
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import {FaUserPlus } from "react-icons/fa";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        username,
        password,
      });

      const { token, userId, role } = response.data;

      if (token) {
        localStorage.setItem("token", token); // Store token in localStorage
        localStorage.setItem("userId", userId.toString());
        localStorage.setItem("role", role);

        login(token, userId, role); //  Call AuthContext login method

        toast.success(`Login Successful! Redirecting to ${role} Panel...`);

        setTimeout(() => {
          if (role === "ADMIN") {
            navigate("/admin");
          } else {
            navigate("/user");
          }
        }, 1500);
      } else {
        throw new Error("No token received!");
      }
    } catch (err) {
      toast.error("Invalid username or password!");
    }
  };

  return (
    <div className="addUser">
      <h3>Sign in</h3>
      <form className="addUserForm" onSubmit={handleLogin}>
        <div className="inputGroup">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-dark">
            Login
          </button>
        </div>
      </form>
      <div className="login">
        <p>Don't have an Account?</p>
        <Link className="navbar-brand navi" to="/register">
          <FaUserPlus className="me-1" /> Register
        </Link>
      </div>
    </div>
  );
};

export default Login;

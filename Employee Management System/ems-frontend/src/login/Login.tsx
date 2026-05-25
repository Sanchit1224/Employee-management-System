import React, { useState, useContext } from "react";
// @ts-ignore: CSS module declarations not available in this project setup
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios"; // ✅ use your configured instance, not raw axios
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaUserPlus } from "react-icons/fa";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ✅ baseURL already set in axios.ts — just write the path
      const response = await API.post("/auth/login", {
        username,
        password,
      });

      const { token, userId, role } = response.data;

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", userId.toString());
        localStorage.setItem("role", role);
        localStorage.setItem("username", username);

        login(token, userId, role, username);

        toast.success(`Login Successful! Redirecting to ${role} Panel...`);

        setTimeout(() => {
          if (role === "ADMIN") navigate("/admin");
          else if (role === "MANAGER") navigate("/manager");
          else navigate("/user");
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
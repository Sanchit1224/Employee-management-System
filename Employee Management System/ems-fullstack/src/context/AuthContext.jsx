import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Correct import
import API from "../api/axios";
import { toast } from "react-toastify";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role") || "USER"; // Default role to USER if missing
    const userId = localStorage.getItem("userId");
    
    return token && userId ? { token, role, userId } : null;
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role") || "USER";
    const userId = localStorage.getItem("userId");

    if (token && role && userId) {
      setUser({ token, role, userId });
    }
  }, []);

  useEffect(() => {
    if (!user?.token) return;

    API.get("/auth/me")
      .then((response) => {
        const serverUser = response.data;
        const roleMismatch = serverUser?.role !== user.role;
        const idMismatch = String(serverUser?.userId) !== String(user.userId);

        if (roleMismatch || idMismatch) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("role");
          localStorage.removeItem("userId");
          setUser(null);
          toast.error("Session mismatch detected. Please login again.");
          navigate("/login");
        }
      })
      .catch(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        setUser(null);
        toast.error("Session expired or invalid. Please login again.");
        navigate("/login");
      });
  }, [user, navigate]);

  const login = (token, userId, role) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId); // Store userId properly

      //  Decode token to verify its content
  try {
    const decodedToken = jwtDecode(token);
    console.log("🔹 Decoded Token:", decodedToken);
  } catch (error) {
    console.error("Error decoding token:", error.message);
  }

    setUser({ token, role, userId });

    if (role === "ADMIN") {
      navigate("/admin");
    } else if (role === "MANAGER") {
      navigate("/manager");
    } else {
      navigate("/user");
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("userId"); //  Remove userId on logout

    setUser(null);
    navigate("/login"); //  Redirect properly
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

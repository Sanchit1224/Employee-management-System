import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FaSignInAlt, FaSignOutAlt, FaUserPlus } from "react-icons/fa";
import AuthContext from "../context/AuthContext";
import "../style/header.css";

function Header() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar bg-body-primary col">
            <div className="container d-flex justify-content-between align-items-center">
                <Link className="navbar-brand navi" to={user ? (user.role === "ADMIN" ? "/admin" : "/user") : "/login"}
                 style={{ fontSize: "1.7rem", fontWeight: "bold" }}>
                    Employee Management System
                </Link>

                <div>
                    {user ? (
                        <>
                            <span className="navbar-brand navi">Welcome, {user.role}!</span>
                            <Link className="navbar-brand navi" to="#" onClick={logout}>
                                <FaSignOutAlt className="me-1" /> Logout
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link className="navbar-brand navi" to="/login">
                                <FaSignInAlt className="me-1" /> Login
                            </Link>
                            <Link className="navbar-brand navi ms-4" to="/register">
                                <FaUserPlus className="me-1" /> Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Header;

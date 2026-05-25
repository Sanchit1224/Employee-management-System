import "./App.css";
import Header from "./component/Header";
import ListEmployeeComponent from "./component/ListEmployeeComponent";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import EmployeeComponent from "./component/EmployeeComponent";
import Login from "./login/Login";
import Signup from "./signup/Signup";
import UserDashboard from "./component/UserDashboard";
import ManagerDashboard from "./component/ManagerDashboard";
import AdminDashboard from "./component/AdminDashboard";
import { useContext } from "react";
import AuthContext from "./context/AuthContext";

const PrivateRoute = ({ role }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  const allowedRoles = Array.isArray(role) ? role : role ? [role] : [];
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN") return <Navigate to="/admin" />;
    if (user.role === "MANAGER") return <Navigate to="/manager" />;
    return <Navigate to="/user" />;
  }
  return <Outlet />;  // ✅ Ensures nested routes work properly
};

function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* ✅ Redirect to login if not logged in */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />

        {/* 🔥 Admin Routes */}
        <Route element={<PrivateRoute role="ADMIN" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/add-employee" element={<EmployeeComponent />} />
          <Route path="/update-employee/:id" element={<EmployeeComponent />} />
        </Route>

        {/* 🔥 Manager Route */}
        <Route element={<PrivateRoute role="MANAGER" />}>
          <Route path="/manager" element={<ManagerDashboard />} />
        </Route>

        {/* 🔥 User Routes */}
        <Route element={<PrivateRoute role="USER" />}>
          <Route path="/user" element={<UserDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

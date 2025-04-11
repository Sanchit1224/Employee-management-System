import "./App.css";
import Header from "./component/Header";
import ListEmployeeComponent from "./component/ListEmployeeComponent";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import EmployeeComponent from "./component/EmployeeComponent";
import Login from "./login/Login";
import Signup from "./signup/Signup";
import UserDashboard from "./component/UserDashboard";
import { useContext } from "react";
import AuthContext from "./context/AuthContext";

const PrivateRoute = ({ role }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    return user.role === "ADMIN" ? <Navigate to="/admin" /> : <Navigate to="/user" />;
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
          <Route path="/admin" element={<ListEmployeeComponent />} />
          <Route path="/add-employee" element={<EmployeeComponent />} />
          <Route path="/update-employee/:id" element={<EmployeeComponent />} />
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

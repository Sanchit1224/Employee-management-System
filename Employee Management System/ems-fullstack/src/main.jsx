import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from "./context/AuthContext"; 
import { BrowserRouter } from "react-router-dom"; // ✅ Keep BrowserRouter here only
import { ToastContainer } from "react-toastify"; // 🔥 Import ToastContainer
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter> {/* ✅ Wrap everything inside ONE BrowserRouter */}
    <AuthProvider>
      <App />
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </AuthProvider>
  </BrowserRouter>,
);

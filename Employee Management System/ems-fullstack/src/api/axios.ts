// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8080",
//   headers: { "Content-Type": "application/json" }
// });

// export default api;

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080", // Update with your backend URL
});

// 🔥 Set Authorization Header on Each Request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

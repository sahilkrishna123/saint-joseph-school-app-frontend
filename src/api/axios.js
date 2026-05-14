import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
//   baseURL: "https://saint-joseph-school-app-backend.onrender.com"
});

export default api;
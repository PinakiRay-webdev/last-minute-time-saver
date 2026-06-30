import axios from "axios";
import { getCookie } from "cookies-next/client";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});



api.interceptors.request.use(
  async (config) => {
      console.log("Here")
    try {
      const token = getCookie("token");

      console.log(token);

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to fetch cookies in Axios interceptor:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;

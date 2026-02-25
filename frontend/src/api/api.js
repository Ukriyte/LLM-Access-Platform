import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000"
});

// attach access token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// auto refresh token logic
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response &&
      err.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(
          "http://localhost:5000/auth/refresh",
          { refreshToken }
        );

        const newAccess = res.data.accessToken;

        localStorage.setItem("accessToken", newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axios(originalRequest);

      } catch (refreshErr) {
        localStorage.clear();
        window.location.href = "/";
      }
    }

    return Promise.reject(err);
  }
);

export default API;
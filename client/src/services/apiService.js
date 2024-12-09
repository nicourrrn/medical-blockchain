import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Add an interceptor to include the token in every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token; // Include the token as a Bearer token
  }
  return config;
});

const apiService = {
  getNonce: (address) => api.get(`/auth/nonce/${address}`).then((res) => res.data),
  verifySignature: (data) => api.post("/auth/verify", data).then((res) => res.data),
  postUserInfo: (data) => api.post("/auth/info", data).then((res) => res.data),
  getUserInfo: () => api.get("/auth/info").then((res) => res.data),
  uploadContract: (data) => api.post("/auth/upload_contract", data).then((res) => res.data),
};

export default apiService;

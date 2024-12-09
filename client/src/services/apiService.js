import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

const apiService = {
  register: (data) => api.post("/auth/register", data).then((res) => res.data),
};

export default apiService;

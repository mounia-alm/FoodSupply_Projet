import axios from "axios";

// Host ports are defined by docker-compose (bypassing Traefik).
const AUTH_API = import.meta.env.VITE_AUTH_API || "http://localhost:8001/api/auth";
const USERS_API = import.meta.env.VITE_USERS_API || "http://localhost:8002/api/users";
const PRODUCTS_API = import.meta.env.VITE_PRODUCTS_API || "http://localhost:8003/api/products";
const ORDERS_API = import.meta.env.VITE_ORDERS_API || "http://localhost:8004/api/orders";

const axiosInstance = axios.create({
  timeout: 15000,
});

function attachToken(config) {
  const t = localStorage.getItem("token") || "";
  if (t) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
}

axiosInstance.interceptors.request.use(attachToken);

async function getJson(url, config) {
  const res = await axiosInstance.get(url, config);
  return res.data;
}

const api = {
  setToken: () => {
    // token is read from localStorage by interceptor.
  },
  auth: {
    login: async ({ email, password }) => {
      const url = `${AUTH_API}/login/`;
      const { data } = await axiosInstance.post(url, { email, password });
      return data;
    },
    register: async (payload) => {
      // backend expects: username, email, password, role, national_id, full_name, phone_number, address
      const url = `${AUTH_API}/register/`;
      const { data } = await axiosInstance.post(url, payload);
      return data;
    },
  },
  users: {
    // Profile endpoints
    profiles: {
      list: async () => getJson(`${USERS_API}/profiles/`),
      create: async (payload) => {
        const { data } = await axiosInstance.post(`${USERS_API}/profiles/`, payload);
        return data;
      },
    },
  },
  products: {
    list: async (params) => {
      const res = await axiosInstance.get(`${PRODUCTS_API}/`, { params });
      return res.data;
    },
    create: async (payload) => {
      const { data } = await axiosInstance.post(`${PRODUCTS_API}/`, payload);
      return data;
    },
    patch: async (id, payload) => {
      const { data } = await axiosInstance.patch(`${PRODUCTS_API}/${id}/`, payload);
      return data;
    },
    remove: async (id) => {
      await axiosInstance.delete(`${PRODUCTS_API}/${id}/`);
      return true;
    },
  },
  orders: {
    list: async (params) => {
      const res = await axiosInstance.get(`${ORDERS_API}/`, { params });
      return res.data;
    },
    create: async (payload) => {
      const { data } = await axiosInstance.post(`${ORDERS_API}/`, payload);
      return data;
    },
    patchStatus: async (id, status) => {
      const { data } = await axiosInstance.patch(`${ORDERS_API}/${id}/`, { status });
      return data;
    },
    patch: async (id, payload) => {
      const { data } = await axiosInstance.patch(`${ORDERS_API}/${id}/`, payload);
      return data;
    },
    remove: async (id) => {
      await axiosInstance.delete(`${ORDERS_API}/${id}/`);
      return true;
    },
  },
};

export default api;


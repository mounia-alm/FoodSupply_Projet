import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

import api from "../services/api";
import { decodeJwt } from "../utils/jwtDecode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  const [userId, setUserId] = useState(() => localStorage.getItem("userId") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Keep token/role in localStorage for persistence.
    const t = localStorage.getItem("token") || "";
    const r = localStorage.getItem("role") || "";
    const uid = localStorage.getItem("userId") || "";
    setToken(t);
    setRole(r);
    setUserId(uid);
    setLoading(false);
  }, []);

  useEffect(() => {
    api.setToken(token);
  }, [token]);

  const isAuthenticated = !!token;

  const value = useMemo(
    () => ({
      token,
      role,
      userId,
      loading,
      isAuthenticated,
      login: async ({ email, password }) => {
        const res = await api.auth.login({ email, password });
        setToken(res.access);
        setRole(res.role);
        localStorage.setItem("token", res.access);
        localStorage.setItem("role", res.role);

        // Extract user id from access token (SimpleJWT standard claim: user_id)
        const payload = decodeJwt(res.access);
        const uid = payload?.user_id ?? "";
        setUserId(String(uid));
        localStorage.setItem("userId", String(uid));
        return res;
      },
      register: async (payload) => {
        // payload includes role + registration fields; username is mapped to email by the backend UI we built.
        const res = await api.auth.register(payload);
        setToken(res.access);
        setRole(res.role);
        localStorage.setItem("token", res.access);
        localStorage.setItem("role", res.role);

        const decoded = decodeJwt(res.access);
        const uid = decoded?.user_id ?? "";
        setUserId(String(uid));
        localStorage.setItem("userId", String(uid));
        return res;
      },
      logout: () => {
        setToken("");
        setRole("");
        setUserId("");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
      },
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{!loading ? children : null}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


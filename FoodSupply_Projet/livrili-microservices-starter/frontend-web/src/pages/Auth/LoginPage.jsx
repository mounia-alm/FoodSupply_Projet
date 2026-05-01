import React, { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated && role) {
    navigate(role === "supplier" ? "/supplier" : "/restaurant", { replace: true });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      navigate(role === "supplier" ? "/supplier" : "/restaurant", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-livrili-greenLight bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-livrili-greenDark">Login</h1>
        <p className="mt-1 text-sm text-gray-600">Access the B2B wholesale platform.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-livrili-greenDark py-2.5 font-semibold text-white hover:bg-livrili-greenMid disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center text-sm">
            No account?{" "}
            <a className="font-semibold text-livrili-greenDark hover:underline" href="/register">
              Register
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}


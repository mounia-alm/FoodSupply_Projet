import React, { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { decodeJwt } from "../../utils/jwtDecode";

export default function RegisterPage() {
  const { register, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    national_id: "",
    full_name: "",
    phone_number: "",
    address: "",
    email: "",
    password: "",
    role: "restaurant",
  });
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
      // Backend expects username + email; we map username to email.
      const payload = {
        username: form.email,
        email: form.email,
        password: form.password,
        role: form.role,
        national_id: form.national_id,
        full_name: form.full_name,
        phone_number: form.phone_number,
        address: form.address,
      };
      const res = await register(payload);

      // Create a matching business profile for the user-service (used for dashboards).
      const decoded = decodeJwt(res.access);
      const uid = decoded?.user_id;
      if (!uid) throw new Error("Could not extract user id from token.");

      await api.users.profiles.create({
        account_id: Number(uid),
        national_id: form.national_id,
        full_name: form.full_name,
        phone_number: form.phone_number,
        address: form.address,
        email: form.email,
        role: form.role,
      });

      navigate(form.role === "supplier" ? "/supplier" : "/restaurant", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data || err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4">
      <div className="w-full rounded-2xl border border-livrili-greenLight bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-livrili-greenDark">Register</h1>
        <p className="mt-1 text-sm text-gray-600">Choose role: supplier or restaurant.</p>

        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="restaurant"
                  checked={form.role === "restaurant"}
                  onChange={() => setForm((f) => ({ ...f, role: "restaurant" }))}
                />
                <span>Restaurant</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="supplier"
                  checked={form.role === "supplier"}
                  onChange={() => setForm((f) => ({ ...f, role: "supplier" }))}
                />
                <span>Supplier</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">National ID</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              value={form.national_id}
              onChange={(e) => setForm((f) => ({ ...f, national_id: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Full name</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone number</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              value={form.phone_number}
              onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          {error && (
            <div className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{String(error)}</div>
          )}

          <div className="sm:col-span-2">
            <button
              disabled={loading}
              className="w-full rounded-xl bg-livrili-greenDark py-2.5 font-semibold text-white hover:bg-livrili-greenMid disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


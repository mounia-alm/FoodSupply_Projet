import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import useProfile from "../hooks/useProfile";

export default function Sidebar({ role }) {
  const { logout, userId } = useAuth();
  const { profile } = useProfile(userId);
  const navigate = useNavigate();
  const isRestaurant = role === "restaurant";
  const activeClass = isRestaurant ? "bg-livrili-orangeDark text-white" : "bg-livrili-greenDark text-white";
  const idleClass = isRestaurant
    ? "text-gray-700 hover:bg-livrili-orangeLight"
    : "text-gray-700 hover:bg-livrili-greenPale";
  const sideBg = isRestaurant ? "bg-livrili-orangePale border-livrili-orangeLight" : "bg-white border-livrili-greenLight";
  const buttonCls = isRestaurant
    ? "w-full rounded-md bg-livrili-orangeDark px-3 py-2 text-white hover:bg-livrili-orangeMid"
    : "w-full rounded-md bg-livrili-greenDark px-3 py-2 text-white hover:bg-livrili-greenMid";

  return (
    <aside className={`w-72 shrink-0 border-r ${sideBg} hidden min-h-screen flex-col lg:flex`}>
      <div className="p-5">
        <div className={`text-2xl font-extrabold ${isRestaurant ? "text-livrili-orangeDark" : "text-livrili-greenDark"}`}>
          Livrili
        </div>
      </div>

      <div className="mx-4 rounded-xl border bg-white p-3 text-sm">
        <div className="font-semibold text-gray-900">{profile?.full_name || "User"}</div>
        <div className="mt-1 text-gray-600">{profile?.phone_number || "No phone"}</div>
        <div className="mt-1 text-gray-600">{profile?.address || "No address"}</div>
      </div>

      <nav className="mt-5 px-3">
        <div className="mb-2 text-xs font-semibold uppercase text-gray-400">Dashboard</div>
        {role === "supplier" && (
          <NavLink
            to="/supplier"
            className={({ isActive }) =>
              isActive ? `block rounded-md px-3 py-2 ${activeClass}` : `block rounded-md px-3 py-2 ${idleClass}`
            }
          >
            Supplier Dashboard
          </NavLink>
        )}
        {role === "restaurant" && (
          <NavLink
            to="/restaurant"
            className={({ isActive }) =>
              isActive ? `block rounded-md px-3 py-2 ${activeClass}` : `block rounded-md px-3 py-2 ${idleClass}`
            }
          >
            Restaurant Dashboard
          </NavLink>
        )}
      </nav>

      <div className="mt-auto px-3 pb-4">
        <button
          className={buttonCls}
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}


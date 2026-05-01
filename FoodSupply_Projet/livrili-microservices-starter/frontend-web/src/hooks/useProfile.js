import { useEffect, useState } from "react";

import api from "../services/api";

export default function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const all = await api.users.profiles.list();
        const match = Array.isArray(all) ? all.find((p) => String(p.account_id) === String(userId)) : null;
        if (!cancelled) setProfile(match);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (userId) load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, loading, error };
}


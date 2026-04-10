import { useEffect, useState } from "react";
import api from "../api/axios";

export default function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/api/users/me");
        setCurrentUser(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch current user:", err);
        setError("Failed to load current user");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return { currentUser, loading, error };
}
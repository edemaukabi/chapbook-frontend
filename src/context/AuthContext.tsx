"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/user/");
      setUser(data);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        // Access token may be expired — try refreshing before treating as logged out.
        // The axios interceptor skips refresh for /auth/user/ to avoid loops, so we
        // handle it explicitly here.
        try {
          await api.post("/auth/token/refresh/", {});
          const { data } = await api.get("/auth/user/");
          setUser(data);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    refetchUser().finally(() => setLoading(false));
  }, [refetchUser]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login/", { email, password });
    // dj-rest-auth includes user details in the login response body.
    // Use it directly instead of a second round-trip to /auth/user/ that
    // can fail if cross-origin cookies haven't been stored yet.
    if (data?.user) {
      setUser(data.user);
    } else {
      await refetchUser();
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout/");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

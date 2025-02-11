"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface User {
  netid: string;
  email: string;
  iat?: number;
  exp?: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  logout: async () => {},
  checkAuth: async () => {},
});

let authCheckPromise: Promise<void> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = useCallback(async () => {
    // If there's already a check in progress, return that promise
    if (authCheckPromise) {
      return authCheckPromise;
    }

    authCheckPromise = fetch("/api/auth/verify")
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.isLoggedIn);
          setUser(data.user);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.error(error);
        setIsLoggedIn(false);
        setUser(null);
      })
      .finally(() => {
        // Clear the promise so future checks can proceed
        authCheckPromise = null;
      });

    return authCheckPromise;
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout");
      if (response.ok) {
        setIsLoggedIn(false);
        setUser(null);
        window.location.href = "/"; // Force reload after logout
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <AuthContext.Provider value={{ isLoggedIn, user, logout, checkAuth }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
};

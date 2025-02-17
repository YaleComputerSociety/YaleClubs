"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface User {
  netid: string;
  email: string;
  role: string;
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

const LOGOUT_VERSION = "1"; // Increment this to force a new logout
const LOGOUT_KEY = "logout_version";

let authCheckPromise: Promise<void> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(async () => {
    if (!isLoggedIn) return;

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
  }, [isLoggedIn]);

  const checkAuth = useCallback(async () => {
    const storedVersion = localStorage.getItem(LOGOUT_KEY);

    if (storedVersion !== LOGOUT_VERSION) {
      console.log("Forcing logout due to version change");
      await logout();
      localStorage.setItem(LOGOUT_KEY, LOGOUT_VERSION); // Mark logout as done
      return;
    }

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
  }, [logout]);

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

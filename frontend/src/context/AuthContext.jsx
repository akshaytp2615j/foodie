import React, { createContext, useState, useEffect } from "react";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem("token"),
    isAuthenticated: false,
    loading: true,
    user: null,
  });
  const [error, setError] = useState(null);

  // Load user from JWT token
  const loadUser = async (token) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setAuthState({
          token,
          isAuthenticated: true,
          loading: false,
          user: data.user,
        });
      } else {
        localStorage.removeItem("token");
        setAuthState({
          token: null,
          isAuthenticated: false,
          loading: false,
          user: null,
        });
      }
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      setAuthState({
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
      });
    }
  };

  useEffect(() => {
    if (authState.token) {
      loadUser(authState.token);
    } else {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, [authState.token]);

  // Login User
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setAuthState({
          token: data.token,
          isAuthenticated: true,
          loading: false,
          user: data.user,
        });
      } else {
        setError(data.error || "Login failed");
        throw new Error(data.error || "Login failed");
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register Restaurant
  const registerRestaurant = async (formData) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register-restaurant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setAuthState({
          token: data.token,
          isAuthenticated: true,
          loading: false,
          user: data.user,
        });
      } else {
        setError(data.error || "Restaurant registration failed");
        throw new Error(data.error || "Restaurant registration failed");
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register NGO
  const registerNGO = async (formData) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register-ngo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setAuthState({
          token: data.token,
          isAuthenticated: true,
          loading: false,
          user: data.user,
        });
      } else {
        setError(data.error || "NGO registration failed");
        throw new Error(data.error || "NGO registration failed");
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null,
    });
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        registerRestaurant,
        registerNGO,
        logout,
        setError,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

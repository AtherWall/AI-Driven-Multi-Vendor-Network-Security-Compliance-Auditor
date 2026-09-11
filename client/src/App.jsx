import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Topology from "./pages/Topology";
import Configurations from "./pages/Configurations";
import AITraining from "./pages/AITraining";
import Compliance from "./pages/Compliance";
import Reports from "./pages/Reports";

import api from "./utils/axios";
import ConfigurationDetails from "./pages/ConfigurationDetails";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/me");

      setUser(response.data.user);
    } catch (error) {
      console.error("Authentication failed:", error);

      localStorage.removeItem("access_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("access_token");
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>
          <p className="mt-4 text-sm text-slate-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Home */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Home refreshUser={fetchCurrentUser} />
          )
        }
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Topology */}
      <Route
        path="/topology"
        element={
          user ? (
            <Topology user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Configurations */}
      <Route
        path="/configurations"
        element={
          user ? (
            <Configurations user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* AI Training */}
      <Route
        path="/ai-training"
        element={
          user ? (
            <AITraining user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Compliance */}
      <Route
        path="/compliance"
        element={
          user ? (
            <Compliance user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          user ? (
            <Reports user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Any unknown URL */}
      <Route
        path="*"
        element={
          <Navigate
            to={user ? "/dashboard" : "/"}
            replace
          />
        }
      />
      <Route path="/configurations/:file_id" element={user ? <ConfigurationDetails user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import api from "./utils/axios";
import Topology from "./pages/Topology";
import Configurations from "./pages/Configurations";
import AITraining from "./pages/AITraining";
import Compliance from "./pages/Compliance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  const [user, setUser] = useState("Arijit");
  const [loading, setLoading] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/me");
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>
          <p className="mt-4 text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>

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

      <Route
        path="/dashboard"
        element={
          user ? (
            <Dashboard user={user} setuser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/topology"
        element={
          user ? (
            <Topology user={user} setuser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/configurations"
        element={
          user ? (
            <Configurations user={user} setuser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/ai-training"
        element={
          user ? (
            <AITraining user={user} setuser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/compliance"
        element={
          user ? (
            <Compliance user={user} setuser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/reports"
        element={
          user ? (
            <Reports user={user} setuser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/settings"
        element={
          user ? (
            <Settings user={user} setuser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
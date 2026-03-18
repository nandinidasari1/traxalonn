import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { currentUser, banned, logout } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;

  if (banned) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#060b14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        color: "#fff",
        textAlign: "center",
        padding: 32,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h1 style={{ color: "#ff4444", fontSize: 24, marginBottom: 8 }}>Account Suspended</h1>
        <p style={{ color: "#8ba8c4", fontSize: 14, maxWidth: 360 }}>
          Your account has been suspended by an administrator.
          Please contact support if you believe this is a mistake.
        </p>
        {/* ✅ Add this */}
        <button
          onClick={logout}
          style={{
            marginTop: 24,
            padding: "10px 24px",
            background: "#ff4444",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return children;
}
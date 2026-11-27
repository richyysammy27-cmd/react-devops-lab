import { useState, useEffect, useCallback } from "react";
import "./App.css";

function App() {
  const appName = import.meta.env.VITE_APP_NAME || "React Docker Lab";
  const apiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");

  const [status, setStatus] = useState("checking");
  const [apiData, setApiData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const checkBackend = useCallback(async () => {
    setStatus("checking");
    setErrorMsg("");

    if (!apiUrl || apiUrl.includes("localhost")) {
      setStatus("offline");
      setErrorMsg("VITE_API_URL is missing or still pointing to localhost.");
      setApiData(null);
      return;
    }

    try {
      const healthRes = await fetch(`${apiUrl}/health`);
      if (!healthRes.ok) {
        throw new Error(`Health check failed (HTTP ${healthRes.status})`);
      }
      const healthJson = await healthRes.json();

      let configJson = null;
      const configRes = await fetch(`${apiUrl}/config`);
      if (configRes.ok) {
        configJson = await configRes.json();
      }

      setApiData({
        health: healthJson.status || "healthy",
        env: configJson?.app_env || "n/a",
        version: configJson?.app_version || "n/a",
      });
      setStatus("online");
    } catch (err) {
      setStatus("offline");
      setErrorMsg(err.message || "Unable to reach backend API");
      setApiData(null);
    }
  }, [apiUrl]);

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  const badgeColor =
    status === "online" ? "#16a34a" : status === "offline" ? "#dc2626" : "#d97706";

  return (
    <main style={{ maxWidth: "540px", margin: "3rem auto", padding: "1.5rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>{appName}</h1>
      <p style={{ color: "#666", marginTop: 0 }}>Full-Stack Container Dashboard</p>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "1.25rem",
          marginTop: "1.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>Backend API Status</strong>
          <span
            style={{
              backgroundColor: badgeColor,
              color: "#fff",
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {status}
          </span>
        </div>

        <p style={{ fontSize: "0.9rem", marginTop: "1rem" }}>
          <strong>Endpoint:</strong> <code>{apiUrl || "Not set"}</code>
        </p>

        {status === "online" && apiData && (
          <ul style={{ lineHeight: "1.8", paddingLeft: "1.2rem" }}>
            <li><strong>Health:</strong> {apiData.health}</li>
            <li><strong>Environment:</strong> <code>{apiData.env}</code></li>
            <li><strong>API Version:</strong> <code>{apiData.version}</code></li>
          </ul>
        )}

        {status === "offline" && (
          <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>
            Connection failed: {errorMsg}
          </p>
        )}

        <button
          onClick={checkBackend}
          disabled={status === "checking"}
          style={{
            marginTop: "0.75rem",
            padding: "0.6rem 1rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {status === "checking" ? "Pinging API..." : "Refresh Status"}
        </button>
      </div>
    </main>
  );
}

export default App;

import { useState, useEffect, useCallback } from "react";
import "./App.css";

function App() {
  const appName = import.meta.env.VITE_APP_NAME || "React Docker Lab";
  const apiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  const apiKey = (import.meta.env.VITE_API_KEY || "").trim();

  const [status, setStatus] = useState("checking");
  const [apiData, setApiData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [message, setMessage] = useState("");
  const [tag, setTag] = useState("lab");
  const [submitting, setSubmitting] = useState(false);
  const [postResult, setPostResult] = useState(null);
  const [postError, setPostError] = useState("");

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

      const configHeaders = apiKey ? { "X-API-Key": apiKey } : {};
      const configRes = await fetch(`${apiUrl}/config`, {
        headers: configHeaders,
      });
      if (!configRes.ok) {
        throw new Error(`Config request failed (HTTP ${configRes.status})`);
      }
      const configJson = await configRes.json();

      const statusRes = await fetch(`${apiUrl}/status`);
      if (!statusRes.ok) {
        throw new Error(`Status request failed (HTTP ${statusRes.status})`);
      }
      const statusJson = await statusRes.json();

      setApiData({
        health: healthJson.status || "healthy",
        env: configJson.app_env || "n/a",
        version: configJson.app_version || "n/a",
        hostname: statusJson.hostname || "n/a",
      });
      setStatus("online");
    } catch (err) {
      setStatus("offline");
      setErrorMsg(err.message || "Unable to reach backend API");
      setApiData(null);
    }
  }, [apiUrl, apiKey]);

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostError("");
    setPostResult(null);

    if (!apiUrl || apiUrl.includes("localhost")) {
      setPostError("Backend endpoint is not configured.");
      return;
    }

    setSubmitting(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(apiKey ? { "X-API-Key": apiKey } : {}),
      };

      const res = await fetch(`${apiUrl}/echo`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message, tag }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `POST failed (HTTP ${res.status})`);
      }

      setPostResult(data);
      setMessage("");
    } catch (err) {
      setPostError(err.message || "Failed to send JSON payload");
    } finally {
      setSubmitting(false);
    }
  };

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
            <li><strong>Host:</strong> <code>{apiData.hostname}</code></li>
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

      <form
        onSubmit={handlePostSubmit}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "1.25rem",
          marginTop: "1.25rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <strong style={{ display: "block", marginBottom: "0.75rem" }}>Send JSON Payload (POST /echo)</strong>

        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Message
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a test message"
            required
            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Tag
          </label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="lab"
            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "0.6rem 1rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#0f766e",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {submitting ? "Sending..." : "Send JSON"}
        </button>

        {postError && (
          <p style={{ color: "#dc2626", fontSize: "0.9rem", marginTop: "0.75rem" }}>
            {postError}
          </p>
        )}

        {postResult && (
          <pre
            style={{
              marginTop: "0.75rem",
              padding: "0.75rem",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px",
              fontSize: "0.8rem",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(postResult, null, 2)}
          </pre>
        )}
      </form>
    </main>
  );
}

export default App;

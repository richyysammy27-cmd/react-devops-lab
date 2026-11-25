import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const appName = import.meta.env.VITE_APP_NAME || "Vite + React";
  const apiUrl = import.meta.env.VITE_API_URL || "Not configured";

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{appName}</h1>
      <p>
        <strong>Configured API URL:</strong> <code>{apiUrl}</code>
      </p>
      <button onClick={() => setCount((c) => c + 1)}>
        Count is {count}
      </button>
    </main>
  );
}

export default App;

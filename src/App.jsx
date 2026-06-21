import { useEffect, useState } from "react";
import TyreViewer from "./components/TyreViewer";
import StatusPanel from "./components/StatusPanel";
import InspectionImages from "./components/InspectionImages";
import HydraulicHealthPanel from "./components/HydraulicHealthPanel";
import EvMotorDashboard from "./components/EvMotorDashboard";
import ThreeBackground from "./components/ThreeBackground";
import VehicleChatbot from "./components/VehicleChatbot";
import "./App.css";


function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTwin, setActiveTwin] = useState("tyre"); // 'tyre' or 'motor'
  const [time, setTime] = useState("");

  // Clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const yyyy = now.getFullYear();
      const mm = pad(now.getMonth() + 1);
      const dd = pad(now.getDate());
      const hh = pad(now.getHours());
      const min = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      setTime(`${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);


  const fetchData = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/latest-result"
      );

      const result = await response.json();

      setData(result);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(
      fetchData,
      2000
    );

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="background-grid"></div>
        <div className="state-screen">
          <span className="dot"></span>
          <h2>Loading Digital Twin…</h2>
          <p>Connecting to inspection backend</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app">
        <div className="background-grid"></div>
        <div className="state-screen state-screen--error">
          <h2>Unable to connect to backend</h2>
          <p>Check that the analysis service is running at 127.0.0.1:8000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <ThreeBackground />
      <div className="background-grid"></div>


      <header className="header">
        <div className="header-title">
          <h1>{activeTwin === "tyre" ? "TYRE AI" : "EV MOTOR AI"}</h1>
          <p>{activeTwin === "tyre" ? "AI Powered Tyre Digital Twin" : "AI Powered EV Motor Digital Twin"}</p>
        </div>

        <div className="header-navigation">
          <button 
            className={`nav-tab-btn ${activeTwin === "tyre" ? "active" : ""}`}
            onClick={() => setActiveTwin("tyre")}
          >
            🚗 Tyre Twin
          </button>
          <button 
            className={`nav-tab-btn ${activeTwin === "motor" ? "active" : ""}`}
            onClick={() => setActiveTwin("motor")}
          >
            ⚡ EV Motor Twin
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {time && (
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--clr-text-secondary)",
              letterSpacing: "0.08em",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-light)",
              padding: "8px 14px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ color: "var(--clr-cyan)", animation: "flash 2s infinite" }}>🕒</span> {time}
            </div>
          )}
          <div className="status-badge">
            <span className="status-dot"></span>
            SYSTEM ONLINE
          </div>
        </div>
      </header>


      {activeTwin === "tyre" && (
        <div className={`alert-banner alert-banner--${data.severity.toLowerCase()}`}>
          <span className="alert-icon">
            {data.severity === "Normal" ? "✓" : "⚠"}
          </span>
          <span className="alert-text">
            {data.severity === "Normal"
              ? "Tyre Condition Nominal - No Action Required"
              : `${data.severity.toUpperCase()} ALERT: ${data.risk_level} Risk Level Detected`}
          </span>
        </div>
      )}

      {activeTwin === "tyre" ? (
        /* MAIN DASHBOARD GRID */
        <main className="dashboard-grid">
          {/* LEFT COLUMN: 3D MODEL, CONTROLS, AND HYDRAULIC ANALYSIS */}
          <section className="dashboard-left">
            <TyreViewer />
            <HydraulicHealthPanel />
          </section>

          {/* RIGHT COLUMN: METRICS, AI RECOMMENDATIONS, INSPECTION IMAGES */}
          <section className="dashboard-right">
            <StatusPanel data={data} />
            <InspectionImages />
          </section>
        </main>
      ) : (
        <EvMotorDashboard />
      )}
      <VehicleChatbot />
    </div>
  );
}

export default App;
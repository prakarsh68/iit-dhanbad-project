import { useEffect, useState, useRef } from "react";
import TyreViewer from "./components/TyreViewer";
import StatusPanel from "./components/StatusPanel";
import InspectionImages from "./components/InspectionImages";
import HydraulicHealthPanel from "./components/HydraulicHealthPanel";
import EvMotorDashboard from "./components/EvMotorDashboard";
import ThreeBackground from "./components/ThreeBackground";
import VehicleChatbot from "./components/VehicleChatbot";
import AiAgentOverlay from "./components/AiAgentOverlay";
import "./App.css";


function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTwin, setActiveTwin] = useState("tyre"); // 'tyre' or 'motor'
  const [time, setTime] = useState("");
  const [isSimulated, setIsSimulated] = useState(false);

  // AI Safety Agent states
  const [aiAgentActive, setAiAgentActive] = useState(false);
  const [aiAgentSource, setAiAgentSource] = useState(""); // 'tyre' or 'motor'
  const [aiAgentReason, setAiAgentReason] = useState("");
  const [overrideActive, setOverrideActive] = useState(false);
  const [lastMitigatedAt, setLastMitigatedAt] = useState(0);
  const [isUnderAiControl, setIsUnderAiControl] = useState(false);

  const motorMitigationRef = useRef(null);

  // Tyre anomaly safety trigger effect
  useEffect(() => {
    if (!data || overrideActive || aiAgentActive || isUnderAiControl) return;
    
    // Check if Tyre twin is warning/critical
    if (data.severity && data.severity !== "Normal") {
      // Avoid looping triggers immediately after mitigation
      if (Date.now() - lastMitigatedAt < 10000) return;

      setAiAgentSource("tyre");
      setAiAgentReason(`Tyre Alert Detected: Severity Level: ${data.severity}, Risk Level: ${data.risk_level}. AI safety lock engaged.`);
      setAiAgentActive(true);
    }
  }, [data, overrideActive, aiAgentActive, lastMitigatedAt, isUnderAiControl]);

  const handleMitigate = () => {
    setIsUnderAiControl(true);
    if (aiAgentSource === "motor" && motorMitigationRef.current) {
      motorMitigationRef.current();
    } else if (aiAgentSource === "tyre") {
      // Simulate Tyre calibration
      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          severity: "Normal",
          risk_level: "Low",
          risk_score: 5,
          health_score: 98,
          recommendations: [
            "Maintain current tyre inflation (32 PSI). Check weekly.",
            "Inspect tread depth periodically.",
            "Ensure alignment is checked every 10,000 km."
          ]
        };
      });
    }
    setLastMitigatedAt(Date.now());
  };

  const handleOverride = () => {
    setOverrideActive(true);
    setAiAgentActive(false);
    setIsUnderAiControl(false);
    // Automatically reset override after 40 seconds to allow safety re-engagement
    setTimeout(() => {
      setOverrideActive(false);
    }, 40000);
  };

  const handleClose = () => {
    setAiAgentActive(false);
  };

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
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://prakarshawasthi-iit-dhanbad-backend.hf.space";
      const response = await fetch(`${apiBaseUrl}/latest-result`);
      if (!response.ok) {
        throw new Error("API response not ok");
      }
      const result = await response.json();
      
      if (result.error || result.severity === undefined || result.health_score === undefined) {
        throw new Error(result.error || "Invalid response format: missing required fields");
      }

      setData(result);
      setIsSimulated(false);
      setLoading(false);
    } catch (err) {
      console.warn("Backend API not reachable. Using fallback mock simulation data.", err);
      // Fallback mock data
      const mockResult = {
        health_score: 94,
        risk_score: 6,
        risk_level: "Low",
        adjusted_km: 15430,
        severity: "Normal",
        vehicle_type: "Sedan",
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        temperature: 34,
        pressure: 32,
        recommendations: [
          "Maintain current tyre inflation (32 PSI). Check weekly.",
          "Inspect tread depth periodically (current tread depth is healthy at 5.5mm).",
          "Ensure alignment is checked every 10,000 km."
        ]
      };
      setData(mockResult);
      setIsSimulated(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(
      fetchData,
      3000
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
          <div className={`status-badge ${isSimulated ? "simulated" : ""}`}>
            <span className="status-dot"></span>
            {isSimulated ? "OFFLINE SIMULATION" : "SYSTEM ONLINE"}
          </div>
        </div>
      </header>

      {isUnderAiControl && (
        <div className="ai-controlled-banner">
          <span className="shield-icon">🛡️</span>
          <span className="banner-text">AI SAFETY ENGAGED: SYSTEM TELEMETRY RESTORED & MANAGED BY AI AGENT</span>
          <button className="banner-dismiss" onClick={() => setIsUnderAiControl(false)}>DISMISS</button>
        </div>
      )}

      {activeTwin === "tyre" && (
        <div className={`alert-banner alert-banner--${isUnderAiControl ? "normal" : data.severity.toLowerCase()}`}>
          <span className="alert-icon">
            {isUnderAiControl || data.severity === "Normal" ? "✓" : "⚠"}
          </span>
          <span className="alert-text">
            {isUnderAiControl 
              ? "TYRE STATE MITIGATED: System stabilized under AI Agent active safety control."
              : data.severity === "Normal"
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
            <StatusPanel data={data} isUnderAiControl={isUnderAiControl} />
            <InspectionImages />
          </section>
        </main>
      ) : (
        <EvMotorDashboard 
          isUnderAiControl={isUnderAiControl}
          onManualControl={() => setIsUnderAiControl(false)}
          onAlertChange={(statusClass, statusText) => {
            if (overrideActive || aiAgentActive || isUnderAiControl) return;
            if (statusClass === "warning" || statusClass === "critical") {
              if (Date.now() - lastMitigatedAt < 10000) return;
              
              setAiAgentSource("motor");
              setAiAgentReason(statusText);
              setAiAgentActive(true);
            }
          }}
          registerMitigation={(mitigateFn) => {
            motorMitigationRef.current = mitigateFn;
          }}
        />
      )}
      <VehicleChatbot />
      {aiAgentActive && (
        <AiAgentOverlay
          source={aiAgentSource}
          reason={aiAgentReason}
          onMitigate={handleMitigate}
          onOverride={handleOverride}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

export default App;
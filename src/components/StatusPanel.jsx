import { useState, useEffect } from "react";

const SpeechButton = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (isPlaying) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  const handleSpeak = (e) => {
    e.stopPropagation();

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Microsoft"))) || voices.find(v => v.lang.startsWith("en"));
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button 
      className={`speech-btn ${isPlaying ? "playing" : ""}`} 
      onClick={handleSpeak}
      title={isPlaying ? "Stop Speech Readout" : "Play Speech Readout"}
      type="button"
      style={{ marginLeft: "auto" }}
    >
      {isPlaying ? (
        <span className="speech-icon-animated">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </span>
      ) : (
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      )}
    </button>
  );
};

export default function StatusPanel({ data }) {
  if (!data) return null;


  const downloadReport = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://prakarshawasthi-iit-dhanbad-backend.hf.space";
    window.open(`${apiBaseUrl}/download-report`, "_blank");
  };

  const getSeverityClass = (sev) => {
    if (!sev) return "kpi-card--blue";
    const s = sev.toLowerCase();
    if (s.includes("normal") || s.includes("healthy")) return "kpi-card--green";
    if (s.includes("warning") || s.includes("moderate") || s.includes("degraded")) return "kpi-card--orange";
    if (s.includes("critical") || s.includes("severe") || s.includes("danger")) return "kpi-card--red";
    return "kpi-card--orange";
  };

  return (
    <div className="status-panel-container">
      {/* KPI GRID */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-card--green">
          <div className="kpi-header">
            <span className="kpi-title">HEALTH SCORE</span>
            <span className="kpi-indicator"></span>
          </div>
          <h1 className="kpi-value">{Math.round(data.health_score)}%</h1>
          <span className="kpi-desc">Overall Integrity</span>
        </div>

        <div className={`kpi-card ${getSeverityClass(data.risk_level)}`}>
          <div className="kpi-header">
            <span className="kpi-title">RISK FACTOR</span>
            <span className="kpi-indicator"></span>
          </div>
          <h1 className="kpi-value">{Math.round(data.risk_score)}%</h1>
          <span className="kpi-desc">{data.risk_level.toUpperCase()} LEVEL</span>
        </div>

        <div className="kpi-card kpi-card--blue">
          <div className="kpi-header">
            <span className="kpi-title">REMAINING LIFE</span>
            <span className="kpi-indicator"></span>
          </div>
          <h1 className="kpi-value">
            {Math.round(data.adjusted_km).toLocaleString()}
            <span className="kpi-unit"> KM</span>
          </h1>
          <span className="kpi-desc">RUL Projection</span>
        </div>

        <div className={`kpi-card ${getSeverityClass(data.severity)}`}>
          <div className="kpi-header">
            <span className="kpi-title">SEVERITY</span>
            <span className="kpi-indicator"></span>
          </div>
          <h1 className="kpi-value">{data.severity.toUpperCase()}</h1>
          <span className="kpi-desc">System Status</span>
        </div>
      </div>

      {/* DETAILED DIAGNOSTICS & TELEMETRY */}
      <div className="glass-card telemetry-card">
        <div className="card-header-high">
          <span className="card-title">VEHICLE TELEMETRY READOUTS</span>
          <span className="card-sub">// SENSOR MATRIX</span>
        </div>

        <div className="telemetry-grid">
          <div className="telemetry-row">
            <span className="label">VEHICLE TYPE</span>
            <span className="value">{data.vehicle_type}</span>
          </div>
          <div className="telemetry-row">
            <span className="label">INSPECTION TIMESTAMP</span>
            <span className="value font-mono">{data.date}</span>
          </div>
          <div className="telemetry-row">
            <span className="label">OPERATIONAL TEMP</span>
            <span className="value font-mono">{data.temperature}°C</span>
          </div>
          <div className="telemetry-row">
            <span className="label">TYRE PRESSURE</span>
            <span className="value font-mono">{data.pressure} PSI</span>
          </div>
        </div>
      </div>

      {/* AI DIAGNOSTICS & ASSESSMENTS */}
      <div className="glass-card recommendations-card">
        <div className="card-header-high">
          <span className="card-title">AI DIAGNOSTICS & THREAT ASSESSMENT</span>
          <span className="card-sub">// ACTION MATRIX</span>
        </div>

        <ul className="rec-list">
          {data.recommendations?.map((item, index) => (
            <li key={index} className="rec-item">
              <span className="rec-bullet">⚡</span>
              <span className="rec-text">{item}</span>
              <SpeechButton text={`Recommendation: ${item}`} />
            </li>
          ))}

          {data.severity === "Normal" && (
            <>
              <li className="rec-item rec-item--healthy">
                <span className="rec-bullet">✓</span>
                <span className="rec-text">No structural anomalies or sidewall cracks detected.</span>
                <SpeechButton text="Assessment: No structural anomalies or sidewall cracks detected." />
              </li>
              <li className="rec-item rec-item--healthy">
                <span className="rec-bullet">✓</span>
                <span className="rec-text">Tyre meets all design specification standards. Continue regular operation.</span>
                <SpeechButton text="Assessment: Tyre meets all design specification standards. Continue regular operation." />
              </li>
            </>
          )}
        </ul>
      </div>

      {/* REPORT EXPORT CONTROLS */}
      <div className="export-action-row">
        <button className="download-btn-premium" onClick={downloadReport}>
          <span className="btn-icon">📄</span> DOWNLOAD OFFICIAL REPORT
        </button>
      </div>
    </div>
  );
}
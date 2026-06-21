import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { uploadHydraulicCSV } from "../services/hydraulicApi";

function HydraulicHealthPanel() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    setLoading(true);

    try {
      const prediction = await uploadHydraulicCSV("EV_001", file);
      console.log(prediction);
      setResult(prediction);
    } catch (err) {
      console.error(err);
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card hydraulic-card">
      <div className="card-header-high">
        <span className="card-title">HYDRAULIC TELEMETRY AUDITOR</span>
        <span className="card-sub">// PRESSURE & FLOW FLUIDICS</span>
      </div>

      <div className="upload-row">
        <div className="file-input-wrapper">
          <input
            type="file"
            accept=".csv"
            id="hydraulic-csv-file"
            className="file-input-hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="hydraulic-csv-file" className="file-input-label">
            <span className="file-icon">📊</span>
            <span className="file-text">
              {file ? file.name.toUpperCase() : "LOAD TELEMETRY DATA (.CSV)"}
            </span>
          </label>
        </div>

        <button className="analyse-btn-premium" onClick={handleAnalyze}>
          <span className="btn-accent"></span>
          RUN DIAGNOSTIC
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <span className="loading-pulse"></span>
          <p className="loading-text">ANALYZING HYDRAULIC CHANNELS...</p>
        </div>
      )}

      {result && <HydraulicResult result={result} />}
    </div>
  );
}

function HydraulicResult({ result }) {
  const getStatusClass = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s.includes("normal") || s.includes("healthy") || s.includes("nominal")) return "kpi-card--green";
    if (s.includes("warning") || s.includes("moderate") || s.includes("degraded") || s.includes("alert")) return "kpi-card--orange";
    return "kpi-card--red";
  };

  const getRiskClass = (risk) => {
    if (!risk) return "";
    const r = risk.toLowerCase();
    if (r.includes("low") || r.includes("normal")) return "kpi-card--green";
    if (r.includes("medium") || r.includes("moderate") || r.includes("warning")) return "kpi-card--orange";
    return "kpi-card--red";
  };

  return (
    <div className="hydraulic-result-container">
      <div className="hydraulic-kpi-grid">
        <div className={`hydraulic-kpi-card ${getStatusClass(result.health_status)}`}>
          <span className="kpi-label">Health Status</span>
          <h3 className="kpi-val">{result.health_status}</h3>
        </div>

        <div className={`hydraulic-kpi-card ${getRiskClass(result.risk_level)}`}>
          <span className="kpi-label">Risk Rating</span>
          <h3 className="kpi-val">{result.risk_level}</h3>
        </div>

        <div className="hydraulic-kpi-card kpi-card--blue">
          <span className="kpi-label">Failure Mode</span>
          <h3 className="kpi-val">{result.failure_mode || "NONE DETECTED"}</h3>
        </div>

        <div className="hydraulic-kpi-card kpi-card--cyan">
          <span className="kpi-label">Confidence</span>
          <h3 className="kpi-val">{(result.health_confidence * 100).toFixed(1)}%</h3>
        </div>
      </div>

      <div className="hydraulic-report-grids">
        <div className="hydraulic-action-card">
          <div className="card-header-high">
            <span className="card-title">RECOMMENDED COMPLIANCE ACTION</span>
            <span className="card-sub">// PROTOCOL</span>
          </div>
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.recommended_action}
            </ReactMarkdown>
          </div>
        </div>

        <div className="hydraulic-analysis-card">
          <div className="card-header-high">
            <span className="card-title">AI NEURAL NETWORK READOUT</span>
            <span className="card-sub">// THREAT LOG</span>
          </div>
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.ai_analysis}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HydraulicHealthPanel;
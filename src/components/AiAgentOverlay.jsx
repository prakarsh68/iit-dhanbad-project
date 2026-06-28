import React, { useEffect, useState, useRef } from "react";
import "./AiAgentOverlay.css";

function AiAgentOverlay({ source, reason, onMitigate, onOverride, onClose }) {
  const [logs, setLogs] = useState([]);
  const [isMitigating, setIsMitigating] = useState(false);
  const [mitigationProgress, setMitigationProgress] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const audioSpoken = useRef(false);

  // 5-second auto-mitigation timer
  useEffect(() => {
    if (isMitigating) return;
    if (countdown <= 0) {
      handleMitigate();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, isMitigating]);

  // Terminal logging animation
  useEffect(() => {
    const messages = [
      `[AI-AGENT] SEIZING INTERFACE CONTROL PROTOCOL...`,
      `[WARNING] Telemetry anomaly registered on: ${source.toUpperCase()} TWIN`,
      `[DIAGNOSTIC] ${reason}`,
      `[LOCKDOWN] Dashboard inputs suspended. Manual override keys required.`,
      `[MONITORING] Waiting for pilot action or automated remediation...`
    ];

    setLogs([]);

    const timeoutIds = [];
    let delay = 0;
    messages.forEach((msg, idx) => {
      const id = setTimeout(() => {
        setLogs((prev) => {
          if (prev.some(log => log.text === msg)) return prev;
          return [...prev, { id: `${idx}-${Date.now()}`, text: msg, timestamp: new Date().toLocaleTimeString() }];
        });
      }, delay);
      timeoutIds.push(id);
      delay += 600;
    });

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [source, reason]);

  // Web Speech synthesis warning readout
  useEffect(() => {
    if (audioSpoken.current) return;
    audioSpoken.current = true;

    // Speech warning utterance
    const speakAlert = () => {
      window.speechSynthesis.cancel();
      const warningText = `Attention. The AI Safety Agent has taken control of the vehicle diagnostic interface. Telemetry reports warning thresholds exceeded on the active ${source} digital twin. Diagnostic summary: ${reason}. Safety systems are now active.`;
      const utterance = new SpeechSynthesisUtterance(warningText);
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Microsoft"))) || voices.find(v => v.lang.startsWith("en"));
      
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 1.0;
      utterance.pitch = 0.95; // Robotic/synthetic pitch
      window.speechSynthesis.speak(utterance);
    };

    // Chrome/Safari voice load delay handler
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speakAlert;
    } else {
      speakAlert();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [source, reason]);

  // Trigger automated mitigation flow
  const handleMitigate = () => {
    setIsMitigating(true);
    setLogs((prev) => [...prev, { id: Date.now(), text: "[ACTION] Initiating automated AI safety mitigation cycle...", timestamp: new Date().toLocaleTimeString() }]);
    
    // Speak mitigation audio
    window.speechSynthesis.cancel();
    const mitUtterance = new SpeechSynthesisUtterance("Initiating automated safety mitigation. Calibrating system levels.");
    window.speechSynthesis.speak(mitUtterance);

    // Call state reset callback in twin
    if (onMitigate) {
      onMitigate();
    }

    const interval = setInterval(() => {
      setMitigationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    setTimeout(() => {
      window.speechSynthesis.cancel();
      const doneUtterance = new SpeechSynthesisUtterance("Mitigation complete. Telemetry normal. Restoring dashboard control.");
      window.speechSynthesis.speak(doneUtterance);
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 2500);
  };

  // Trigger manual override de-authorization
  const handleOverride = () => {
    window.speechSynthesis.cancel();
    const overrideUtterance = new SpeechSynthesisUtterance("Manual control override authorized. Returning dashboard control to pilot. Warning: anomaly remains active.");
    window.speechSynthesis.speak(overrideUtterance);
    setTimeout(() => {
      onOverride();
    }, 500);
  };

  return (
    <div className="ai-agent-hud">
      <div className="hud-overlay-grid"></div>
      
      <div className="hud-scanner-container">
        <div className="hud-scanline"></div>
      </div>

      <div className="hud-alert-frame">
        <div className="hud-header">
          <div className="header-status">
            <span className="pulse-dot red"></span>
            <span className="status-label">AI SAFETY AGENT ACTIVE // AUTONOMOUS MODE</span>
          </div>
          <div className="hud-title">WARNING: CRITICAL STATUS OVERRIDE</div>
        </div>

        <div className="hud-body">
          {/* Main Info Card */}
          <div className="hud-main-card">
            <div className="card-glitch-bg"></div>
            <h3>SYSTEM LEVEL SUSPENSION ENGAGED</h3>
            <p className="hud-desc">
              The AI Safety Agent has temporarily suspended manual operations of the dashboard controls. 
              The system telemetry is being redirected through safety control loops to prevent component failure.
            </p>

            <div className="hud-anomaly-info">
              <div className="anomaly-item">
                <span className="label">ACTIVE ERROR SOURCE:</span>
                <span className="value highlight">{source.toUpperCase()} DIGITAL TWIN</span>
              </div>
              <div className="anomaly-item">
                <span className="label">ANOMALY SUMMARY:</span>
                <span className="value">{reason}</span>
              </div>
            </div>
            
            {isMitigating ? (
              <div className="hud-progress-section">
                <div className="progress-label-row">
                  <span>RECONCILING TELEMETRY STATE...</span>
                  <span>{mitigationProgress}%</span>
                </div>
                <div className="hud-progress-bar">
                  <div className="hud-progress-fill" style={{ width: `${mitigationProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="hud-controls">
                <button className="hud-btn primary" onClick={handleMitigate}>
                  🛡️ EXECUTE AUTOMATED AI MITIGATION (AUTO-ENGAGE IN {countdown}s)
                </button>
                <button className="hud-btn secondary" onClick={handleOverride}>
                  ⚠️ DE-AUTHORIZE & OVERRIDE LOCK
                </button>
              </div>
            )}
          </div>

          {/* Terminal Console Card */}
          <div className="hud-console">
            <div className="console-header">SYSTEM DIAGNOSTIC CONSOLE</div>
            <div className="console-lines">
              {logs.map((log) => (
                <div key={log.id} className="console-line">
                  <span className="timestamp">[{log.timestamp}]</span>{" "}
                  <span className="text">{log.text}</span>
                </div>
              ))}
              {!isMitigating && logs.length === 5 && (
                <div className="console-cursor">_</div>
              )}
            </div>
          </div>
        </div>

        <div className="hud-footer">
          <span>SECURE SYSTEM CONNECTION // ENCRYPTED FEED</span>
          <span>ANTIGRAVITY SAFETY OS v1.0.4</span>
        </div>
      </div>
    </div>
  );
}

export default AiAgentOverlay;

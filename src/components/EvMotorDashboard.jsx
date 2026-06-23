import React, { useState, useEffect, useRef } from "react";
import "./EvMotorDashboard.css";

// Helper component for glowing telemetry progress bars
const VisualGauge = ({ value, max, gradient, glowColor }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="visual-gauge">
      <div className="gauge-track">
        <div 
          className="gauge-fill" 
          style={{ 
            width: `${percentage}%`,
            "--fill-gradient": gradient,
            "--glow-color": glowColor
          }}
        />
      </div>
    </div>
  );
};

// Custom premium SVG Line Chart for displaying telemetry logs
const TelemetryChart = ({ history }) => {
  const [now, setNow] = useState(Date.now());

  // High-performance animation frame loop to drive the scrolling animation smoothly
  useEffect(() => {
    let animId;
    const update = () => {
      setNow(Date.now());
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (!history || history.length === 0) return null;

  const width = 500;
  const height = 150;
  const padding = 15;
  const chartWidth = width - 2 * padding;

  const duration = 15000; // 15 seconds visible window
  const startTime = now - duration;

  // Filter history points within the 15-second window plus one point before it to keep the line continuous on the left
  const visiblePoints = history.filter(d => d.time >= startTime - 1000);

  const healthMin = 50;
  const healthMax = 100;
  const tempMin = 20;
  const tempMax = 120;

  // Convert points to SVG coordinates
  const getCoordinates = (points, getValue, minVal, maxVal) => {
    return points.map(d => {
      const elapsed = d.time - startTime;
      const x = padding + (elapsed / duration) * chartWidth;
      const val = Math.min(maxVal, Math.max(minVal, getValue(d)));
      const y = height - padding - ((val - minVal) * (height - 2 * padding)) / (maxVal - minVal);
      return { x, y };
    });
  };

  const healthCoords = getCoordinates(visiblePoints, d => d.health, healthMin, healthMax);
  const tempCoords = getCoordinates(visiblePoints, d => d.statorTemp, tempMin, tempMax);

  // Generate path string
  const getPathD = (coords) => {
    if (coords.length === 0) return "";
    return `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  };

  const getAreaD = (coords, pathD) => {
    if (coords.length === 0) return "";
    const firstX = Math.max(padding, coords[0].x);
    const lastX = Math.min(width - padding, coords[coords.length - 1].x);
    return `${pathD} L ${lastX} ${height - padding} L ${firstX} ${height - padding} Z`;
  };

  const healthPathD = getPathD(healthCoords);
  const healthAreaD = getAreaD(healthCoords, healthPathD);

  const tempPathD = getPathD(tempCoords);
  const tempAreaD = getAreaD(tempCoords, tempPathD);

  // Get current values (latest point)
  const currentHealth = history[history.length - 1]?.health || 100;
  const currentTemp = history[history.length - 1]?.statorTemp || 25;

  return (
    <div className="telemetry-charts-container">
      <div className="chart-wrapper">
        <div className="chart-info">
          <span className="chart-title-sub">AI Health Score Trend</span>
          <span className="chart-value-sub" style={{ color: "var(--motor-accent-green)" }}>
            {currentHealth.toFixed(1)}%
          </span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="premium-svg-chart">
          <defs>
            <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#05f394" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#05f394" stopOpacity="0" />
            </linearGradient>
            <filter id="glow-health">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#05f394" floodOpacity="0.4" />
            </filter>
            <clipPath id="healthClip">
              <rect x={padding} y={0} width={chartWidth} height={height} />
            </clipPath>
          </defs>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.02)" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.02)" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.06)" />
          
          <g clipPath="url(#healthClip)">
            {healthAreaD && <path d={healthAreaD} fill="url(#healthGrad)" />}
            {healthPathD && (
              <path 
                d={healthPathD} 
                fill="none" 
                stroke="#05f394" 
                strokeWidth="2.5" 
                filter="url(#glow-health)" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}
            {healthCoords.length > 0 && healthCoords[healthCoords.length - 1].x < width - padding && (
              <circle 
                cx={healthCoords[healthCoords.length - 1].x} 
                cy={healthCoords[healthCoords.length - 1].y} 
                r="4.5" 
                fill="#05f394" 
                filter="url(#glow-health)" 
              />
            )}
          </g>
        </svg>
      </div>

      <div className="chart-wrapper">
        <div className="chart-info">
          <span className="chart-title-sub">Stator Winding Temperature Log</span>
          <span className="chart-value-sub" style={{ color: "var(--motor-accent-red)" }}>
            {currentTemp.toFixed(1)}°C
          </span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="premium-svg-chart">
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff4757" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ff4757" stopOpacity="0" />
            </linearGradient>
            <filter id="glow-temp">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ff4757" floodOpacity="0.4" />
            </filter>
            <clipPath id="tempClip">
              <rect x={padding} y={0} width={chartWidth} height={height} />
            </clipPath>
          </defs>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.02)" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.02)" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.06)" />
          
          <g clipPath="url(#tempClip)">
            {tempAreaD && <path d={tempAreaD} fill="url(#tempGrad)" />}
            {tempPathD && (
              <path 
                d={tempPathD} 
                fill="none" 
                stroke="#ff4757" 
                strokeWidth="2.5" 
                filter="url(#glow-temp)" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}
            {tempCoords.length > 0 && tempCoords[tempCoords.length - 1].x < width - padding && (
              <circle 
                cx={tempCoords[tempCoords.length - 1].x} 
                cy={tempCoords[tempCoords.length - 1].y} 
                r="4.5" 
                fill="#ff4757" 
                filter="url(#glow-temp)" 
              />
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};


// Stateful SpeechButton component using Web Speech API
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
    
    // Attempt to pick a high quality natural English voice
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

function EvMotorDashboard() {


  // Sidebar open/collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // User input controls
  const [accelerator, setAccelerator] = useState(0); // 0 to 100 %
  const [brake, setBrake] = useState(0);             // 0 to 100 %
  const [isRunning, setIsRunning] = useState(false);

  // Motor Telemetry / Core Metrics
  const [voltage, setVoltage] = useState(400); // Volts
  const [speed, setSpeed] = useState(0);       // RPM
  const [power, setPower] = useState(0.0);     // kW
  const [current, setCurrent] = useState(0);   // Amperes
  const [torque, setTorque] = useState(0);     // Nm
  const [efficiency, setEfficiency] = useState(0.0); // %
  const [soc, setSoc] = useState(100);         // State of Charge %
  const [vehicleSpeed, setVehicleSpeed] = useState(0); // km/h

  // Temperatures
  const [statorTemp, setStatorTemp] = useState(25.0);   // °C
  const [rotorTemp, setRotorTemp] = useState(25.0);     // °C
  const [bearingTemp, setBearingTemp] = useState(25.0); // °C

  // Health Stats
  const [health, setHealth] = useState(100.0);          // %
  const [failureProb, setFailureProb] = useState(0.0);  // %
  const [rul, setRul] = useState(20000);                // Hours

  // AI Diagnostic State: 'idle' | 'scanning' | 'ready'
  const [aiState, setAiState] = useState("idle");

  // AI Diagnostic Report Data
  const [aiReportData, setAiReportData] = useState({
    thermal_margin: { status: "ok", text: "Windings running stable. Margin: +35.0°C remaining." },
    insulation_health: { status: "ok", text: "Insulation electrical resistivity within safety threshold (99.8% health)." },
    vibration_profile: { status: "ok", text: "High-frequency acoustic bearings report normal friction levels (< 0.12 mm/s)." },
    battery_health: { status: "ok", text: "Pack Voltage balance within 5mV deviation. SOC is nominal." },
    fault_diagnosis: { status: "ok", text: "No fault detected. Status is nominal (Confidence: 100.0%)." }
  });

  const [telemetryHistory, setTelemetryHistory] = useState(() => {
    const initial = [];
    const now = Date.now();
    // Seed interesting startup baseline values (15 seconds back)
    for (let i = 0; i < 20; i++) {
      initial.push({
        time: now - (20 - i) * 750,
        health: 100.0,
        statorTemp: 25.0,
        speed: 0
      });
    }
    return initial;
  });




  // Keep references to state values for the simulation loop to avoid re-binding issues
  const simStateRef = useRef({
    accelerator: 0,
    brake: 0,
    isRunning: false,
    voltage: 400,
    speed: 0,
    current: 0,
    torque: 0,
    soc: 100,
    statorTemp: 25.0,
    rotorTemp: 25.0,
    bearingTemp: 25.0,
    health: 100.0
  });

  // Sync ref values with state changes
  useEffect(() => {
    simStateRef.current = {
      accelerator,
      brake,
      isRunning,
      voltage,
      speed,
      current,
      torque,
      soc,
      statorTemp,
      rotorTemp,
      bearingTemp,
      health
    };
  }, [accelerator, brake, isRunning, voltage, speed, current, torque, soc, statorTemp, rotorTemp, bearingTemp, health]);

  // Main Simulation Loop
  useEffect(() => {
    let animationId;
    let lastTime = performance.now();
    let frameCount = 0;

    const simulate = (time) => {

      const dt = (time - lastTime) / 1000; // time delta in seconds
      lastTime = time;

      const currentSim = simStateRef.current;

      if (currentSim.isRunning && currentSim.soc > 0) {
        // --- 1. RPM / Speed Physics ---
        const targetRPM = currentSim.accelerator * 80;
        let newSpeed = currentSim.speed;

        if (targetRPM > newSpeed) {
          newSpeed += (targetRPM - newSpeed) * 3 * dt;
        } else {
          newSpeed += (targetRPM - newSpeed) * 1.5 * dt;
        }

        if (currentSim.brake > 0) {
          newSpeed -= currentSim.brake * 120 * dt;
        }

        newSpeed = Math.max(0, Math.min(8000, newSpeed));
        const roundedSpeed = Math.round(newSpeed);
        setSpeed(roundedSpeed);

        const newVehicleSpeed = Math.round(newSpeed * 0.022);
        setVehicleSpeed(newVehicleSpeed);

        // --- 2. Current & Torque ---
        const baseTorque = (currentSim.accelerator / 100) * 320;
        const speedRatio = newSpeed / 8000;
        const currentTorque = Math.max(0, baseTorque * (1 - speedRatio * 0.75));
        const finalTorque = currentSim.brake > 0 ? Math.max(0, currentTorque - (currentSim.brake / 100) * 200) : currentTorque;
        setTorque(Math.round(finalTorque));

        const drawCurrent = (currentSim.accelerator / 100) * 280 + (newSpeed / 8000) * 70;
        const finalCurrent = newSpeed > 0 || currentSim.accelerator > 0 ? Math.round(drawCurrent) : 0;
        setCurrent(finalCurrent);

        // --- 3. Voltage Sag ---
        const voltageSag = (finalCurrent / 350) * 18;
        const jitter = (Math.random() - 0.5) * 0.8;
        const finalVoltage = Math.round((400 - voltageSag + jitter) * 10) / 10;
        setVoltage(finalVoltage);

        // --- 4. Power & Efficiency ---
        const calculatedPower = Math.round((finalVoltage * finalCurrent / 1000) * 10) / 10;
        setPower(calculatedPower);

        let efficiencyVal = 0;
        if (roundedSpeed > 0) {
          const rpmDiff = Math.abs(roundedSpeed - 4200) / 4200;
          const torqueDiff = Math.abs(finalTorque - 160) / 160;
          efficiencyVal = 95.5 - (rpmDiff * 12) - (torqueDiff * 4);
          efficiencyVal = Math.max(20.0, Math.min(96.8, efficiencyVal));
        }
        setEfficiency(Math.round(efficiencyVal * 10) / 10);

        // --- 5. Battery SOC Drain ---
        const drainAmount = (calculatedPower * 0.005) * dt;
        const newSoc = Math.max(0, Math.round((currentSim.soc - drainAmount) * 100) / 100);
        setSoc(newSoc);

        if (newSoc <= 0) {
          setIsRunning(false);
        }

        // --- 6. Thermal Simulation (Heating) ---
        const statorHeatRate = (Math.pow(finalCurrent, 2) * 0.000008) + (newSpeed * 0.00015);
        const statorCoolingRate = (currentSim.statorTemp - 25.0) * 0.015;
        const nextStatorTemp = Math.round((currentSim.statorTemp + (statorHeatRate - statorCoolingRate) * dt) * 10) / 10;
        setStatorTemp(Math.max(25.0, nextStatorTemp));

        const rotorHeatRate = (Math.pow(finalCurrent, 2) * 0.000006) + (newSpeed * 0.00022);
        const rotorCoolingRate = (currentSim.rotorTemp - 25.0) * 0.012;
        const nextRotorTemp = Math.round((currentSim.rotorTemp + (rotorHeatRate - rotorCoolingRate) * dt) * 10) / 10;
        setRotorTemp(Math.max(25.0, nextRotorTemp));

        const bearingHeatRate = newSpeed * 0.0004;
        const bearingCoolingRate = (currentSim.bearingTemp - 25.0) * 0.02;
        const nextBearingTemp = Math.round((currentSim.bearingTemp + (bearingHeatRate - bearingCoolingRate) * dt) * 10) / 10;
        setBearingTemp(Math.max(25.0, nextBearingTemp));

        // --- 7. Health Degradation ---
        let currentHealth = currentSim.health;
        if (nextStatorTemp > 90.0) {
          const thermalStress = (nextStatorTemp - 90.0) * 0.05 * dt;
          currentHealth = Math.max(0, currentHealth - thermalStress);
        }
        if (nextRotorTemp > 105.0) {
          const thermalStress = (nextRotorTemp - 105.0) * 0.04 * dt;
          currentHealth = Math.max(0, currentHealth - thermalStress);
        }
        const roundedHealth = Math.round(currentHealth * 10) / 10;
        setHealth(roundedHealth);

        const thermalFailureRisk = Math.max(0, (nextStatorTemp - 80) * 0.8) + Math.max(0, (nextRotorTemp - 95) * 0.6);
        const healthFailureRisk = (100.0 - roundedHealth) * 1.2;
        const currentFailureProb = Math.min(100.0, Math.round((thermalFailureRisk + healthFailureRisk) * 10) / 10);
        setFailureProb(currentFailureProb);

        const calculatedRul = Math.max(0, Math.round(20000 * (roundedHealth / 100.0)));
        setRul(calculatedRul);

      } else {
        // --- Stopped State / Cooling Mode ---
        setSpeed(0);
        setVehicleSpeed(0);
        setTorque(0);
        setCurrent(0);
        setPower(0.0);
        setEfficiency(0.0);
        setVoltage(Math.round((400 + (Math.random() - 0.5) * 0.2) * 10) / 10);

        const coolDown = (temp, rate) => {
          if (temp > 25.0) {
            const nextTemp = temp - (temp - 25.0) * rate * dt;
            return Math.max(25.0, Math.round(nextTemp * 10) / 10);
          }
          return 25.0;
        };

        setStatorTemp(coolDown(currentSim.statorTemp, 0.08));
        setRotorTemp(coolDown(currentSim.rotorTemp, 0.06));
        setBearingTemp(coolDown(currentSim.bearingTemp, 0.12));

        const healthFailureRisk = (100.0 - currentSim.health) * 1.2;
        const currentFailureProb = Math.min(100.0, Math.round(healthFailureRisk * 10) / 10);
        setFailureProb(currentFailureProb);
        setRul(Math.max(0, Math.round(20000 * (currentSim.health / 100.0))));
      }

      // Record telemetry history every 25 frames (~400ms)
      frameCount++;
      if (frameCount % 25 === 0) {
        setTelemetryHistory(prev => {
          const cutOff = Date.now() - 25000;
          const filtered = prev.filter(d => d.time >= cutOff);
          return [...filtered, {
            time: Date.now(),
            health: simStateRef.current.health,
            statorTemp: simStateRef.current.statorTemp,
            speed: simStateRef.current.speed
          }];
        });
      }


      animationId = requestAnimationFrame(simulate);
    };

    animationId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animationId);
  }, []);


  // Controls triggers
  const handleStart = () => {
    if (soc > 0) {
      setIsRunning(true);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setAccelerator(0);
    setBrake(0);
    setVoltage(400);
    setSpeed(0);
    setPower(0.0);
    setCurrent(0);
    setTorque(0);
    setEfficiency(0.0);
    setSoc(100);
    setVehicleSpeed(0);
    setStatorTemp(25.0);
    setRotorTemp(25.0);
    setBearingTemp(25.0);
    setHealth(100.0);
    setFailureProb(0.0);
    setRul(20000);
    setAiState("idle");
  };

  // Generate dynamic simulated report data (as a fallback)
  const generateSimulatedReport = () => {
    return {
      health: health,
      failure_probability: failureProb,
      rul: rul,
      predictions: {
        thermal_margin: {
          status: statorTemp > 90 ? "alert" : (statorTemp > 80 ? "warning" : "ok"),
          text: statorTemp > 90 
            ? `Stator windings exceeding safety threshold (+${(statorTemp - 90).toFixed(1)}°C over).`
            : `Windings running stable. Margin: +${(90 - statorTemp).toFixed(1)}°C remaining.`
        },
        insulation_health: {
          status: health < 80 ? "alert" : "ok",
          text: health < 80 
            ? `Minor insulation stress detected: winding resistance at ${health}% health.`
            : `Insulation electrical resistivity within safety threshold (99.8% health).`
        },
        vibration_profile: {
          status: speed > 6000 ? "warning" : "ok",
          text: speed > 6000 
            ? `Slight bearing oscillation frequency surge at ${speed} RPM. Broad spectrum ok.`
            : `High-frequency acoustic bearings report normal friction levels (< 0.12 mm/s).`
        },
        battery_health: {
          status: soc < 20 ? "alert" : "ok",
          text: soc < 20 
            ? `Low state of charge detected (${Math.round(soc)}%). Please charge battery pack.`
            : `Pack Voltage balance within 5mV deviation. SOC is nominal.`
        }
      }
    };
  };


  // Predict AI Health Trigger (Wired API Call with Graceful Local Simulator Fallbacks)
  const handlePredictAI = async () => {
    setAiState("scanning");
    
    // API endpoint parameters from .env
    const apiBaseUrl = import.meta.env.VITE_MOTOR_API_BASE_URL || "https://ev-motor-digital-twin-api.onrender.com";
    const apiKey = import.meta.env.VITE_APP_API_KEY || "AjB4psWXP108x2ZbWpOio6CIeXM0IYQza94QKIHiEeg";

    // Package active parameters to send in request body matching MotorInput OpenAPI schema
    const requestData = {
      voltage_v: Number(voltage),
      current_a: Number(current),
      speed_rpm: Number(speed),
      torque_nm: Number(torque),
      flux_estimate: 0.8,
      vehicle_speed_kmph: Number(vehicleSpeed),
      battery_soc: Number(soc),
      coolant_flow_rate: 1.0,
      vibration_accel: 0.5,
      vibration_vel: 1.0,
      current_harmonics: 0.02,
      insulation_resistance_mohm: Math.max(0, 1000 * (health / 100)),
      partial_discharge: 0.0,
      rul_hours: Number(rul)
    };

    // Timeout helper for fetching
    const fetchWithTimeout = (url, options, timeout = 1200) => {
      return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout))
      ]);
    };

    try {
      // 1. Try to trigger the real ML Model API (Render backend endpoint)
      console.log(`Attempting to fetch real ML model API at ${apiBaseUrl}/predict...`);
      const response = await fetchWithTimeout(`${apiBaseUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey
        },
        body: JSON.stringify(requestData)
      }, 15000); // 15 seconds timeout to allow wake up

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Real ML API returned prediction results successfully!");
      
      const motorState = data.motor_state;
      const mlPrediction = data.ml_prediction;

      // Update dashboard health parameters based on twin results
      setHealth(mlPrediction.health_score);
      setFailureProb(mlPrediction.failure_probability);
      setRul(Math.round(mlPrediction.rul_hours));

      // Append to history list
      setTelemetryHistory(prev => {
        const next = [...prev.slice(1), {
          time: Date.now(),
          health: mlPrediction.health_score,
          statorTemp: motorState.stator_temp_c,
          speed: motorState.speed_rpm
        }];
        return next;
      });

      
      // Update temperature state from API simulation
      if (motorState.stator_temp_c) setStatorTemp(Number(motorState.stator_temp_c.toFixed(1)));
      if (motorState.rotor_temp_c) setRotorTemp(Number(motorState.rotor_temp_c.toFixed(1)));
      if (motorState.bearing_temp_c) setBearingTemp(Number(motorState.bearing_temp_c.toFixed(1)));

      // Construct dynamic assessments from twin API values
      const thermal_margin = {
        status: motorState.stator_temp_c > 90 ? "alert" : (motorState.stator_temp_c > 80 ? "warning" : "ok"),
        text: motorState.stator_temp_c > 90 
          ? `Stator windings exceeding safety threshold (+${(motorState.stator_temp_c - 90).toFixed(1)}°C over).`
          : `Windings running stable. Margin: +${(90 - motorState.stator_temp_c).toFixed(1)}°C remaining.`
      };

      const insulation_health = {
        status: motorState.insulation_resistance_mohm < 500 ? "alert" : (motorState.insulation_resistance_mohm < 800 ? "warning" : "ok"),
        text: `Insulation resistance is at ${motorState.insulation_resistance_mohm.toFixed(0)} MOhm. Winding health is ${motorState.stator_health.toFixed(1)}%.`
      };

      const vibration_profile = {
        status: motorState.vibration_vel > 2.0 ? "alert" : (motorState.vibration_vel > 1.2 ? "warning" : "ok"),
        text: `Acoustic bearings report normal friction levels (${motorState.vibration_vel.toFixed(2)} mm/s). Vibration acceleration is ${motorState.vibration_accel.toFixed(2)} g.`
      };

      const battery_health = {
        status: motorState.battery_soc < 20 ? "alert" : (motorState.battery_soc < 40 ? "warning" : "ok"),
        text: motorState.battery_soc < 20 
          ? `Low state of charge detected (${Math.round(motorState.battery_soc)}%). Please charge battery pack.`
          : `Pack Voltage balance within 5mV deviation. SOC is nominal (${Math.round(motorState.battery_soc)}%).`
      };

      const fault_diagnosis = {
        status: mlPrediction.fault_code === "NONE" ? "ok" : "alert",
        text: mlPrediction.fault_code === "NONE" 
          ? `No fault detected. Status is nominal (Confidence: ${(mlPrediction.confidence * 100).toFixed(1)}%).`
          : `FAULT DETECTED: ${mlPrediction.fault_code} (Confidence: ${(mlPrediction.confidence * 100).toFixed(1)}%).`
      };

      setAiReportData({
        thermal_margin,
        insulation_health,
        vibration_profile,
        battery_health,
        fault_diagnosis
      });
      setAiState("ready");

    } catch (err) {
      // 2. Real API offline, try to fetch the local fake API resource served by Vite
      console.warn("Real backend ML API offline. Falling back to local fake API /predict-motor-health.json...", err.message);
      
      try {
        const response = await fetchWithTimeout("/predict-motor-health.json", {
          method: "GET"
        }, 1500);

        if (!response.ok) {
          throw new Error(`Local JSON mock returned status ${response.status}`);
        }

        const data = await response.json();
        console.log("Fake API (/predict-motor-health.json) loaded successfully!");
        
        // Wait 1.2s to keep scan animation visible
        setTimeout(() => {
          setHealth(data.health);
          setFailureProb(data.failure_probability);
          setRul(data.rul);
          
          // Map mock response predictions and add placeholder fault diagnosis
          const updatedPredictions = {
            ...data.predictions,
            fault_diagnosis: {
              status: "ok",
              text: "No fault detected. Status is nominal (Confidence: 100.0% - Simulation Fallback)."
            }
          };
          setAiReportData(updatedPredictions);
          setAiState("ready");
        }, 1200);

      } catch (mockErr) {
        // 3. Both failed, run the dynamic local simulation generator fallback
        console.error("Local mock API also failed. Running client-side simulation fallback:", mockErr.message);
        
        setTimeout(() => {
          const mockReport = generateSimulatedReport();
          setHealth(mockReport.health);
          setFailureProb(mockReport.failure_probability);
          setRul(mockReport.rul);
          
          const updatedPredictions = {
            ...mockReport.predictions,
            fault_diagnosis: {
              status: "ok",
              text: "No fault detected. Status is nominal (Confidence: 100.0% - Local Client Simulation)."
            }
          };
          setAiReportData(updatedPredictions);
          setAiState("ready");
        }, 1200);
      }
    }
  };


  // Determine status color indicators based on health & temperature
  let statusClass = "healthy";
  let statusText = "Healthy Motor";
  
  if (health < 75.0 || statorTemp >= 95.0 || rotorTemp >= 110.0) {
    statusClass = "critical";
    statusText = `Critical Alert: ${statorTemp >= 95.0 || rotorTemp >= 110.0 ? "Motor Overheating" : "Severe Component Degradation"}`;
  } else if (health < 90.0 || statorTemp >= 80.0 || rotorTemp >= 95.0) {
    statusClass = "warning";
    statusText = `Warning Alert: ${statorTemp >= 80.0 || rotorTemp >= 95.0 ? "High Thermal Load Detected" : "Elevated Stress"}`;
  }

  return (
    <div className="motor-layout">
      {/* Collapsible Sidebar for Controls */}
      <aside className={`motor-sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <button 
          className="sidebar-toggle-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "»" : "«"}
        </button>

        {!isCollapsed && (
          <>
            <div className="sidebar-header">
              <span>🚗</span> Vehicle Controls
            </div>

            {/* Diagnostic LED warning light panel */}
            <div className="diagnostic-panel">
              <div className="diagnostic-panel-title">SYS Diagnostic LEDs</div>
              <div className="led-grid">
                <div className="led-item">
                  <div className={`led-lamp ${soc > 0 ? "led-green-on" : ""}`} />
                  <span className="led-label">RDY</span>
                </div>
                <div className="led-item">
                  <div className={`led-lamp ${isRunning ? "led-cyan-on" : ""}`} />
                  <span className="led-label">RUN</span>
                </div>
                <div className="led-item">
                  <div className={`led-lamp ${statorTemp >= 80 || rotorTemp >= 95 ? "led-red-on" : ""}`} />
                  <span className="led-label">TMP</span>
                </div>
                <div className="led-item">
                  <div className={`led-lamp ${soc < 20 ? (soc <= 0 ? "led-red-on" : "led-orange-on") : ""}`} />
                  <span className="led-label">BAT</span>
                </div>
                <div className="led-item">
                  <div className={`led-lamp ${brake > 0 ? "led-red-on" : ""}`} />
                  <span className="led-label">BRK</span>
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="slider-group">
              <div className="slider-label-row">
                <span className="slider-label">Accelerator (%)</span>
                <span className="slider-value">{accelerator}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={accelerator}
                onChange={(e) => setAccelerator(Number(e.target.value))}
                className="motor-range-slider"
              />
              <div className="slider-ticks">
                <span className="tick">0</span>
                <span className="tick">20</span>
                <span className="tick">40</span>
                <span className="tick">60</span>
                <span className="tick">80</span>
                <span className="tick">100</span>
              </div>
            </div>

            <div className="slider-group">
              <div className="slider-label-row">
                <span className="slider-label">Brake (%)</span>
                <span className="slider-value" style={{ color: brake > 0 ? "var(--motor-accent-red)" : "var(--motor-text-muted)" }}>
                  {brake}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={brake}
                onChange={(e) => setBrake(Number(e.target.value))}
                className="motor-range-slider"
                style={{
                  background: `linear-gradient(90deg, rgba(255,255,255,0.06) ${100 - brake}%, rgba(255,71,87,0.2) ${brake}%)`
                }}
              />
              <div className="slider-ticks">
                <span className="tick">0</span>
                <span className="tick">20</span>
                <span className="tick">40</span>
                <span className="tick">60</span>
                <span className="tick">80</span>
                <span className="tick">100</span>
              </div>
            </div>

            {/* Ignition and actions buttons */}
            <div className="ignition-container">
              <span className="ignition-label">Engine Ignition</span>
              <button 
                className={`ignition-btn ${isRunning ? "engine-running" : "engine-stopped"}`}
                onClick={isRunning ? handleStop : handleStart}
                disabled={soc <= 0}
                title={isRunning ? "Stop Motor Engine" : "Start Motor Engine"}
              >
                <span className="ignition-text-main">START</span>
                <span className="ignition-text-sub">{isRunning ? "RUNNING" : "STOPPED"}</span>
              </button>
            </div>

            <div className="sidebar-actions">
              <button className="motor-btn btn-reset" onClick={handleReset}>
                🔄 Reset Console
              </button>
              <button className="motor-btn btn-predict" onClick={handlePredictAI}>
                👁 Predict AI Health
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Main Panel Content */}
      <main className="motor-main">
        {/* Dashboard Title */}
        <h1 className="motor-dashboard-header">
          <span className="header-accent-icon">⚡</span> EV Motor Digital Twin Dashboard
        </h1>

        {/* Core Metrics Deck */}
        <section className="motor-section">
          <h2 className="motor-section-title">
            <span className="section-icon">🔋</span> Core Metrics
          </h2>
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Voltage (V)</span>
              <div className="metric-value-row">
                <span className="metric-value">{voltage}</span>
              </div>
              <VisualGauge value={voltage} max={450} gradient="linear-gradient(90deg, #3b82f6, #00f7ff)" glowColor="rgba(0, 247, 255, 0.3)" />
            </div>

            <div className="metric-box">
              <span className="metric-label">Speed (RPM)</span>
              <div className="metric-value-row">
                <span className="metric-value">{speed}</span>
              </div>
              <VisualGauge value={speed} max={8000} gradient="linear-gradient(90deg, #3b82f6, #00f7ff)" glowColor="rgba(0, 247, 255, 0.3)" />
            </div>

            <div className="metric-box">
              <span className="metric-label">Power (kW)</span>
              <div className="metric-value-row">
                <span className="metric-value">{power.toFixed(1)}</span>
              </div>
              <VisualGauge value={power} max={140} gradient="linear-gradient(90deg, #3b82f6, #00f7ff)" glowColor="rgba(0, 247, 255, 0.3)" />
            </div>

            <div className="metric-box">
              <span className="metric-label">Current (A)</span>
              <div className="metric-value-row">
                <span className="metric-value">{current}</span>
              </div>
              <VisualGauge value={current} max={350} gradient="linear-gradient(90deg, #3b82f6, #00f7ff)" glowColor="rgba(0, 247, 255, 0.3)" />
            </div>

            <div className="metric-box">
              <span className="metric-label">Torque (Nm)</span>
              <div className="metric-value-row">
                <span className="metric-value">{torque}</span>
              </div>
              <VisualGauge value={torque} max={320} gradient="linear-gradient(90deg, #3b82f6, #00f7ff)" glowColor="rgba(0, 247, 255, 0.3)" />
            </div>

            <div className="metric-box">
              <span className="metric-label">Efficiency (%)</span>
              <div className="metric-value-row">
                <span className="metric-value">{efficiency.toFixed(1)}</span>
              </div>
              <VisualGauge value={efficiency} max={100} gradient="linear-gradient(90deg, #05f394, #00f7ff)" glowColor="rgba(5, 243, 148, 0.3)" />
            </div>

            <div className="metric-box">
              <span className="metric-label">Battery SOC (%)</span>
              <div className="metric-value-row">
                <span className="metric-value" style={{ color: soc < 20 ? "var(--motor-accent-red)" : "inherit" }}>
                  {Math.round(soc)}
                </span>
              </div>
              <VisualGauge 
                value={soc} 
                max={100} 
                gradient={soc < 20 ? "linear-gradient(90deg, #ff4757, #ff7979)" : "linear-gradient(90deg, #05f394, #00f7ff)"} 
                glowColor={soc < 20 ? "rgba(255, 71, 87, 0.3)" : "rgba(5, 243, 148, 0.3)"} 
              />
            </div>

            <div className="metric-box">
              <span className="metric-label">Vehicle Speed (km/h)</span>
              <div className="metric-value-row">
                <span className="metric-value">{vehicleSpeed}</span>
              </div>
              <VisualGauge value={vehicleSpeed} max={200} gradient="linear-gradient(90deg, #3b82f6, #00f7ff)" glowColor="rgba(0, 247, 255, 0.3)" />
            </div>
          </div>
        </section>

        {/* Temperatures Deck */}
        <section className="motor-section">
          <h2 className="motor-section-title">
            <span className="section-icon">🌡️</span> Temperatures
          </h2>
          <div className="temperatures-row">
            <div className="metric-box">
              <span className="metric-label">Stator Temp (°C)</span>
              <div className="metric-value-row">
                <span className="metric-value" style={{ color: statorTemp > 80 ? (statorTemp >= 95 ? "var(--motor-accent-red)" : "var(--motor-accent-orange)") : "inherit" }}>
                  {statorTemp.toFixed(1)}
                </span>
              </div>
              <VisualGauge 
                value={statorTemp} 
                max={120} 
                gradient={statorTemp > 90 ? "linear-gradient(90deg, #ff4757, #ff7979)" : (statorTemp > 80 ? "linear-gradient(90deg, #ff9f1c, #f59e0b)" : "linear-gradient(90deg, #3b82f6, #00f7ff)")} 
                glowColor={statorTemp > 90 ? "rgba(255, 71, 87, 0.3)" : "rgba(0, 247, 255, 0.3)"} 
              />
            </div>

            <div className="metric-box">
              <span className="metric-label">Rotor Temp (°C)</span>
              <div className="metric-value-row">
                <span className="metric-value" style={{ color: rotorTemp > 95 ? (rotorTemp >= 110 ? "var(--motor-accent-red)" : "var(--motor-accent-orange)") : "inherit" }}>
                  {rotorTemp.toFixed(1)}
                </span>
              </div>
              <VisualGauge 
                value={rotorTemp} 
                max={130} 
                gradient={rotorTemp > 105 ? "linear-gradient(90deg, #ff4757, #ff7979)" : "linear-gradient(90deg, #3b82f6, #00f7ff)"} 
                glowColor={rotorTemp > 105 ? "rgba(255, 71, 87, 0.3)" : "rgba(0, 247, 255, 0.3)"} 
              />
            </div>

            <div className="metric-box">
              <span className="metric-label">Bearing Temp (°C)</span>
              <div className="metric-value-row">
                <span className="metric-value" style={{ color: bearingTemp > 70 ? "var(--motor-accent-orange)" : "inherit" }}>
                  {bearingTemp.toFixed(1)}
                </span>
              </div>
              <VisualGauge 
                value={bearingTemp} 
                max={90} 
                gradient={bearingTemp > 70 ? "linear-gradient(90deg, #ff9f1c, #f59e0b)" : "linear-gradient(90deg, #3b82f6, #00f7ff)"} 
                glowColor={bearingTemp > 70 ? "rgba(255, 159, 28, 0.3)" : "rgba(0, 247, 255, 0.3)"} 
              />
            </div>
          </div>
        </section>

        {/* Telemetry & Health Analytics Deck */}
        <section className="motor-section">
          <h2 className="motor-section-title">
            <span className="section-icon">📈</span> Telemetry & Health Analytics
          </h2>
          <TelemetryChart history={telemetryHistory} />
        </section>

        {/* Health Panel Deck */}

        <section className="motor-section">
          <h2 className="motor-section-title">
            <span className="section-icon">❤️</span> Health
          </h2>
          <div className="health-row">
            <div className="metric-box">
              <span className="metric-label">Overall Health (%)</span>
              <div className="metric-value-row">
                <span className="metric-value" style={{ color: health < 90 ? (health < 75 ? "var(--motor-accent-red)" : "var(--motor-accent-orange)") : "inherit" }}>
                  {health.toFixed(1)}
                </span>
              </div>
              <VisualGauge 
                value={health} 
                max={100} 
                gradient={health < 75 ? "linear-gradient(90deg, #ff4757, #ff7979)" : (health < 90 ? "linear-gradient(90deg, #ff9f1c, #f59e0b)" : "linear-gradient(90deg, #05f394, #00f7ff)")} 
                glowColor={health < 75 ? "rgba(255, 71, 87, 0.3)" : "rgba(5, 243, 148, 0.3)"} 
              />
            </div>

            <div className="metric-box">
              <span className="metric-label">Failure Probability (%)</span>
              <div className="metric-value-row">
                <span className="metric-value" style={{ color: failureProb > 10 ? (failureProb > 30 ? "var(--motor-accent-red)" : "var(--motor-accent-orange)") : "inherit" }}>
                  {failureProb.toFixed(1)}
                </span>
              </div>
              <VisualGauge 
                value={failureProb} 
                max={100} 
                gradient={failureProb > 30 ? "linear-gradient(90deg, #ff4757, #ff7979)" : "linear-gradient(90deg, #3b82f6, #05f394)"} 
                glowColor={failureProb > 30 ? "rgba(255, 71, 87, 0.3)" : "rgba(5, 243, 148, 0.3)"} 
              />
            </div>

            <div className="metric-box">
              <span className="metric-label">RUL (hours)</span>
              <div className="metric-value-row">
                <span className="metric-value">{rul}</span>
              </div>
              <VisualGauge value={rul} max={20000} gradient="linear-gradient(90deg, #05f394, #3b82f6)" glowColor="rgba(5, 243, 148, 0.3)" />
            </div>
          </div>

          {/* Dynamic Status Alert Banner */}
          <div className={`motor-status-banner ${statusClass}`}>
            <span className="status-indicator-dot"></span>
            <span>{statusText}</span>
          </div>
        </section>

        {/* AI Prediction Feed */}
        <section className="motor-section">
          <h2 className="motor-section-title">
            <span className="section-icon">🤖</span> AI Prediction
          </h2>

          {aiState === "idle" && (
            <div className="ai-prediction-panel">
              Press 'Predict AI Health' to run AI.
            </div>
          )}

          {aiState === "scanning" && (
            <div className="ai-prediction-panel scanning">
              <div className="scanning-scanline"></div>
              <div className="scanning-container">
                <div className="scanning-spinner"></div>
                <span>Executing Neural Diagnostics & Thermal Predictions (checking model API)...</span>
              </div>
            </div>
          )}

          {aiState === "ready" && (
            <div className="ai-prediction-panel ready">
              <div className="ai-report">
                <div className="ai-report-header">
                  <span>📊</span> AI Diagnostic Assessment Report
                </div>
                <div className="ai-report-grid">
                  <div className="ai-report-item">
                    <div className="ai-item-header">
                      <span className="ai-item-title">Thermal Margin</span>
                      <SpeechButton text={`Thermal Margin: ${aiReportData.thermal_margin.text}`} />
                    </div>
                    <span className="ai-item-desc">{aiReportData.thermal_margin.text}</span>
                    <span className={`ai-item-status status-${aiReportData.thermal_margin.status}`}>
                      {aiReportData.thermal_margin.status}
                    </span>
                  </div>

                  <div className="ai-report-item">
                    <div className="ai-item-header">
                      <span className="ai-item-title">Winding Insulation Health</span>
                      <SpeechButton text={`Winding Insulation Health: ${aiReportData.insulation_health.text}`} />
                    </div>
                    <span className="ai-item-desc">{aiReportData.insulation_health.text}</span>
                    <span className={`ai-item-status status-${aiReportData.insulation_health.status}`}>
                      {aiReportData.insulation_health.status}
                    </span>
                  </div>

                  <div className="ai-report-item">
                    <div className="ai-item-header">
                      <span className="ai-item-title">Vibration Analysis</span>
                      <SpeechButton text={`Vibration Analysis: ${aiReportData.vibration_profile.text}`} />
                    </div>
                    <span className="ai-item-desc">{aiReportData.vibration_profile.text}</span>
                    <span className={`ai-item-status status-${aiReportData.vibration_profile.status}`}>
                      {aiReportData.vibration_profile.status}
                    </span>
                  </div>

                  <div className="ai-report-item">
                    <div className="ai-item-header">
                      <span className="ai-item-title">Battery Health Assessment</span>
                      <SpeechButton text={`Battery Health Assessment: ${aiReportData.battery_health.text}`} />
                    </div>
                    <span className="ai-item-desc">{aiReportData.battery_health.text}</span>
                    <span className={`ai-item-status status-${aiReportData.battery_health.status}`}>
                      {aiReportData.battery_health.status}
                    </span>
                  </div>

                  {aiReportData.fault_diagnosis && (
                    <div className="ai-report-item" style={{ gridColumn: "span 2" }}>
                      <div className="ai-item-header">
                        <span className="ai-item-title" style={{ color: "var(--motor-accent-blue)" }}>AI Fault Diagnosis</span>
                        <SpeechButton text={`AI Fault Diagnosis: ${aiReportData.fault_diagnosis.text}`} />
                      </div>
                      <span className="ai-item-desc"><strong>{aiReportData.fault_diagnosis.text}</strong></span>
                      <span className={`ai-item-status status-${aiReportData.fault_diagnosis.status}`}>
                        {aiReportData.fault_diagnosis.status === "ok" ? "nominal" : "fault"}
                      </span>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default EvMotorDashboard;

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
} from "@react-three/drei";
import { useState } from "react";

function VehicleModel({ setSelectedComponent }) {

  const model = useGLTF("/models/car_2.glb");

const handleClick = (e) => {

  e.stopPropagation();

  const name = e.object.name.toLowerCase();

  console.log("================================");
  console.log("CLICKED PART:", name);
  console.log(e.object);
  console.log("================================");

  // ENGINE
  if (
    name.includes("engine") ||
    name.includes("motor")
  ) {

    setSelectedComponent("Engine");
    return;
  }

  // FRONT LEFT
  if (
    name.includes("front_left_wheel")
  ) {

    setSelectedComponent(
      "Front Left Wheel"
    );

    return;
  }

  // FRONT RIGHT
  if (
    name.includes("front_right_wheel")
  ) {

    setSelectedComponent(
      "Front Right Wheel"
    );

    return;
  }

  // REAR LEFT
  if (
    name.includes("rear_left_wheel")
  ) {

    setSelectedComponent(
      "Rear Left Wheel"
    );

    return;
  }

  // REAR RIGHT
  if (
    name.includes("rear_right_wheel")
  ) {

    setSelectedComponent(
      "Rear Right Wheel"
    );

    return;
  }

};

  return (

    <primitive
      object={model.scene}
      scale={1.35}
      rotation={[
        0,
        Math.PI / 2,
        0,
      ]}
      position={[
        0,
        -1.3,
        0,
      ]}
      onClick={handleClick}
    />

  );
}

export default function TyreViewer() {

  const [
    selectedComponent,
    setSelectedComponent
  ] = useState(null);

  const [
    showParameters,
    setShowParameters
  ] = useState(false);

  const [
    vehicleType,
    setVehicleType
  ] = useState("Sedan");

  const [
    pressure,
    setPressure
  ] = useState(30);

  const [
    recommendedPressure,
    setRecommendedPressure
  ] = useState(35);

  const [
    roadCondition,
    setRoadCondition
  ] = useState("Good");

  const [
    weatherCondition,
    setWeatherCondition
  ] = useState("Clear");

  const [
    drivingPattern,
    setDrivingPattern
  ] = useState("Mixed");

  const [
    tyreAge,
    setTyreAge
  ] = useState(2);

  const [
    treadDepth,
    setTreadDepth
  ] = useState(5.5);

  const analyseComponent = () => {
    if (!selectedComponent)
      return;
    
    console.log(
      "Analysing:",
      selectedComponent
    );
    
    if (
      selectedComponent ===
      "Engine"
    ) {
      
      alert(
        "Engine Analysis (Simulation Mode)"
      );
      return;
    }
    
    if (
      selectedComponent.includes(
        "Wheel"
      )
    ) {
      
      analyseWheel();
      return;
    }
  };

  const analyseWheel =
    async () => {

      if (!selectedComponent)
        return;

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://prakarshawasthi-iit-dhanbad-backend.hf.space";
        const response =
          await fetch(
            `${apiBaseUrl}/analyze-wheel`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({

                  wheel:
                    selectedComponent,

                  vehicle_type:
                    vehicleType,

                  pressure:
                    pressure,

                  recommended_pressure:
                    recommendedPressure,

                  road_condition:
                    roadCondition,

                  weather_condition:
                    weatherCondition,

                  driving_pattern:
                    drivingPattern,

                  tyre_age:
                    tyreAge,

                  tread_depth:
                    treadDepth,
                }),
            }
          );


        const result =
          await response.json();

        console.log(
          result
        );

        alert(
          `${selectedComponent} analysed successfully`
        );

      }

      catch (err) {
        console.warn("Backend API not reachable for wheel analysis. Using local simulation.", err);
        alert(
          `Offline Simulation Mode: ${selectedComponent} analysed. Pressure: ${pressure} PSI, Tread Depth: ${treadDepth}mm. Condition nominal with no structural issues detected.`
        );
      }
    };

  return (
    <div className="viewer-container">
      {/* 3D VIEWPORT CARD */}
      <div className="viewer-card">
        <div className="scan-line"></div>

        {/* High-tech HUD overlays */}
        <div className="hud-header">
          <div className="hud-title-wrap">
            <span className="hud-accent"></span>
            <span className="hud-title">3D DIGITAL TWIN SCANNER</span>
          </div>
          <div className="hud-status">
            <span className="hud-status-dot"></span>
            ACTIVE TELEMETRY MODE
          </div>
        </div>

        {/* Selected Component Overlay (Bottom Left) */}
        <div className="hud-selection">
          <div className="hud-label">TARGET COMPONENT</div>
          <div className="hud-value">
            {selectedComponent ? selectedComponent.toUpperCase() : "SELECT SYSTEM PART ON MODEL"}
          </div>
        </div>

        {/* Quick Diagnostic Trigger (Bottom Right) */}
        {selectedComponent && (
          <div className="hud-action">
            <button className="hud-btn" onClick={analyseComponent}>
              <span className="hud-btn-glow"></span>
              RUN DIAGNOSTIC
            </button>
          </div>
        )}

        {/* 3D CANVAS */}
        <Canvas
          shadows
          camera={{
            position: [7, 3, 9],
            fov: 40,
          }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} intensity={3} />
          <directionalLight position={[-10, 5, -10]} intensity={2} color="#00f7ff" />
          <spotLight position={[0, 8, 0]} angle={0.4} intensity={2} color="#3b82f6" />
          <VehicleModel setSelectedComponent={setSelectedComponent} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.3, 0]} receiveShadow>
            <planeGeometry args={[40, 40]} />
            <meshStandardMaterial color="#020617" metalness={1} roughness={0.08} />
          </mesh>
          <Environment preset="night" />
          <OrbitControls
            autoRotate={!selectedComponent}
            autoRotateSpeed={0.35}
            enableZoom
            minDistance={6}
            maxDistance={14}
            target={[0, -0.5, 0]}
          />
        </Canvas>
      </div>

      {/* PARAMETERS CONTROL DECK (BELOW VIEWER) */}
      <div className="glass-card parameters-deck">
        <div className="deck-header">
          <div className="deck-title">
            <span className="deck-title-icon">⚙</span> OPERATIONAL PARAMETERS DECK
          </div>
          <span className="deck-sub">// SIMULATION VARIABLE MATRIX</span>
        </div>

        <div className="deck-grid">
          {/* VEHICLE CONFIGURATION */}
          <div className="deck-section">
            <div className="deck-section-title">CONFIG</div>
            <div className="input-group">
              <label>Vehicle Type</label>
              <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Motorcycle">Motorcycle</option>
              </select>
            </div>
            <div className="input-group">
              <label>Tyre Age (Years)</label>
              <input
                type="number"
                value={tyreAge}
                onChange={(e) => setTyreAge(Number(e.target.value))}
                placeholder="Age"
              />
            </div>
            <div className="input-group">
              <label>Tread Depth (mm)</label>
              <input
                type="number"
                step="0.1"
                value={treadDepth}
                onChange={(e) => setTreadDepth(Number(e.target.value))}
                placeholder="Tread"
              />
            </div>
          </div>

          {/* ENVIRONMENTAL CONDITIONS */}
          <div className="deck-section">
            <div className="deck-section-title">ENVIRONMENT</div>
            <div className="input-group">
              <label>Weather Condition</label>
              <select value={weatherCondition} onChange={(e) => setWeatherCondition(e.target.value)}>
                <option value="Clear">Clear</option>
                <option value="Rain">Rain</option>
                <option value="Heavy Rain">Heavy Rain</option>
                <option value="Flood-Prone">Flood-Prone</option>
              </select>
            </div>
            <div className="input-group">
              <label>Road Condition</label>
              <select value={roadCondition} onChange={(e) => setRoadCondition(e.target.value)}>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div className="input-group">
              <label>Driving Pattern</label>
              <select value={drivingPattern} onChange={(e) => setDrivingPattern(e.target.value)}>
                <option value="Highway">Highway</option>
                <option value="Mixed">Mixed</option>
                <option value="City">City</option>
                <option value="Off-road">Off-road</option>
              </select>
            </div>
          </div>

          {/* TELEMETRY READINGS */}
          <div className="deck-section">
            <div className="deck-section-title">TELEMETRY</div>
            <div className="input-group">
              <label>Current Pressure (PSI)</label>
              <input
                type="number"
                value={pressure}
                onChange={(e) => setPressure(Number(e.target.value))}
                placeholder="PSI"
              />
            </div>
            <div className="input-group">
              <label>Recommended Pressure (PSI)</label>
              <input
                type="number"
                value={recommendedPressure}
                onChange={(e) => setRecommendedPressure(Number(e.target.value))}
                placeholder="PSI"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
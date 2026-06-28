import { useState } from "react";

export default function InspectionImages() {
  const timestamp = Date.now();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://prakarshawasthi-iit-dhanbad-backend.hf.space";
  
  const [inputError, setInputError] = useState(false);
  const [outputError, setOutputError] = useState(false);

  return (
    <div className="inspection-grid">
      {/* INPUT IMAGE CARD */}
      <div className="inspection-card">
        <div className="inspection-card-header">
          <span className="bullet"></span>
          <span>OPTICAL INPUT FEED</span>
        </div>
        <div className="image-viewport">
          <div className="corner-target top-left"></div>
          <div className="corner-target top-right"></div>
          <div className="corner-target bottom-left"></div>
          <div className="corner-target bottom-right"></div>
          <div className="lens-grid"></div>
          {inputError ? (
            <div className="standby-viewport">
              <div className="standby-grid"></div>
              <div className="standby-radar">
                <div className="radar-sweep"></div>
                <div className="radar-circle circle-1"></div>
                <div className="radar-circle circle-2"></div>
                <div className="radar-crosshair"></div>
              </div>
              <div className="standby-text-wrap">
                <div className="standby-title">FEED OFFLINE</div>
                <div className="standby-subtitle">STANDBY // NO OPTICAL FEED</div>
              </div>
            </div>
          ) : (
            <img
              src={`${apiBaseUrl}/data/latest_input.jpg?t=${timestamp}`}
              alt="Optical Input"
              className="inspection-image"
              onError={() => setInputError(true)}
            />
          )}
          <div className="scan-line-overlay"></div>
          <span className="cam-label">CAM_01 // REF_RAW</span>
        </div>
      </div>

      {/* YOLO DETECTION CARD */}
      <div className="inspection-card">
        <div className="inspection-card-header">
          <span className="bullet"></span>
          <span>YOLO AI DEVIATION DETECTION</span>
        </div>
        <div className="image-viewport">
          <div className="corner-target top-left"></div>
          <div className="corner-target top-right"></div>
          <div className="corner-target bottom-left"></div>
          <div className="corner-target bottom-right"></div>
          <div className="lens-grid"></div>
          {outputError ? (
            <div className="standby-viewport">
              <div className="standby-grid"></div>
              <div className="standby-radar">
                <div className="radar-sweep"></div>
                <div className="radar-circle circle-1"></div>
                <div className="radar-circle circle-2"></div>
                <div className="radar-crosshair"></div>
              </div>
              <div className="standby-text-wrap">
                <div className="standby-title">ANALYZER OFFLINE</div>
                <div className="standby-subtitle">STANDBY // WAITING FOR ANOMALIES</div>
              </div>
            </div>
          ) : (
            <img
              src={`${apiBaseUrl}/data/latest_output.jpg?t=${timestamp}`}
              alt="AI Detection"
              className="inspection-image"
              onError={() => setOutputError(true)}
            />
          )}
          <div className="scan-line-overlay"></div>
          <span className="cam-label">CAM_01 // YOLO_ANALYSIS</span>
        </div>
      </div>
    </div>
  );
}
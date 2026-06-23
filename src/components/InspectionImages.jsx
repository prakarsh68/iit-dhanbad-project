export default function InspectionImages() {
  const timestamp = Date.now();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://prakarshawasthi-iit-dhanbad-backend.hf.space";

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
          <img
            src={`${apiBaseUrl}/data/latest_input.jpg?t=${timestamp}`}
            alt="Optical Input"
            className="inspection-image"
          />
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
          <img
            src={`${apiBaseUrl}/data/latest_output.jpg?t=${timestamp}`}
            alt="AI Detection"
            className="inspection-image"
          />
          <div className="scan-line-overlay"></div>
          <span className="cam-label">CAM_01 // YOLO_ANALYSIS</span>
        </div>
      </div>
    </div>
  );
}
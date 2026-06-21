import Navbar from "../components/Navbar";
import HealthPanel from "../components/HealthPanel";
import HydraulicHealthPanel from "../components/HydraulicHealthPanel";

function Dashboard() {
  return (
    <div className="app">
      <div className="background-grid"></div>

      <Navbar />

      <main>
        {/* 3D Tyre Area */}
        <div className="viewer-card">
          <div className="scan-line"></div>
          <div className="viewer-title">3D TYRE VIEWER</div>
        </div>

        {/* Right Side Panels */}
        <div className="status-panel">
          <HealthPanel />
          <HydraulicHealthPanel />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
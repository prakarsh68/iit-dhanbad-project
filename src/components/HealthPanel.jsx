import { tyreData } from "../data/tyreData";

function HealthPanel() {
  return (
    <div
      style={{
        background: "#0f172a",
        borderRadius: "20px",
        padding: "30px",
      }}
    >
      <h2>Tyre Health</h2>

      <hr />

      <h1>{tyreData.health}%</h1>

      <p>Remaining Life: {tyreData.rul} Days</p>

      <p>Temperature: {tyreData.temperature}°C</p>

      <p>Pressure: {tyreData.pressure} PSI</p>

      <p>Defect: {tyreData.defects[0].type}</p>
    </div>
  );
}

export default HealthPanel;
// src/services/hydraulicApi.js

const API_KEY =
  import.meta.env.VITE_HYDRAULIC_API_KEY ||
  "5611ef24790093d63ba87a8ba22fd6e12e6e0a4da34d2290b402bb8062efd261";

export async function uploadHydraulicCSV(
  vehicleId,
  file
) {
  const formData = new FormData();

  formData.append("vehicle_id", vehicleId);
  formData.append("file", file);

  const response = await fetch(
    "https://hydraulic-ev-api.onrender.com/predict/upload",
    {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Prediction failed");
  }

  return response.json();
}
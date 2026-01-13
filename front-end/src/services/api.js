const API_BASE = "http://localhost:5000";

export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append("video", file);

  const res = await fetch(`${API_BASE}/api/upload-video`, {
    method: "POST",
    body: formData,
  });

  return res.json();
};

export const getStatistics = async () =>
  fetch(`${API_BASE}/api/statistics`).then(r => r.json());

export const getViolations = async () =>
  fetch(`${API_BASE}/api/violations`).then(r => r.json());

export const getEmergencyVehicles = async () =>
  fetch(`${API_BASE}/api/emergency-vehicles`).then(r => r.json());

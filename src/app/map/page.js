'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import UploadAudioPage from "../upload/page";
import Navbar from '@/components/Navbar';

// Dynamically import Leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

const defaultPosition = [12.9716, 77.5946];

export default function AudioMap() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [markerIcon, setMarkerIcon] = useState({ default: null, nearby: null });
  const [showUpload, setShowUpload] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const L = require("leaflet");

    const defaultIcon = L.icon({
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    const nearbyIcon = L.icon({
      iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    setMarkerIcon({ default: defaultIcon, nearby: nearbyIcon });

    fetchAudioAndNearbyFiles();
  }, []);

  async function fetchAudioAndNearbyFiles() {
    const bearerToken = localStorage.getItem("authToken");
    if (!navigator.geolocation) return;

    try {
      const userRes = await axios.get("https://echo-trails-backend.vercel.app/audio/user/files", {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });
      const userFiles = userRes.data.audio_files || [];

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const nearbyRes = await axios.get(
            `https://echo-trails-backend.vercel.app/audio/nearby/?latitude=${latitude}&longitude=${longitude}`,
            {
              headers: { Authorization: `Bearer ${bearerToken}` },
            }
          );

          const nearbyFiles = nearbyRes.data.nearby_files || [];
          const nearbyIds = new Set(nearbyFiles.map(file => file._id));

          const allFilesMap = new Map();

          for (const file of userFiles) {
            allFilesMap.set(file._id, { ...file, isNearby: nearbyIds.has(file._id) });
          }

          for (const file of nearbyFiles) {
            if (!allFilesMap.has(file._id)) {
              allFilesMap.set(file._id, { ...file, isNearby: true });
            }
          }

          setAudioFiles(Array.from(allFilesMap.values()));
        } catch (err) {
          console.error("❌ Error fetching nearby audio files:", err);
        }
      });
    } catch (err) {
      console.error("❌ Error fetching user audio files:", err);
    }
  }

  const validAudioFiles = audioFiles.filter(
    (file) =>
      file?.location &&
      Array.isArray(file.location.coordinates) &&
      file.location.coordinates.length === 2 &&
      typeof file.location.coordinates[0] === "number" &&
      typeof file.location.coordinates[1] === "number"
  );

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
    },
    mapContainer: {
      flex: 1,
      position: 'relative',
      height: 'calc(100vh - 80px)',
    },
    mapWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    uploadButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 1000,
      padding: '10px 20px',
      fontSize: '16px',
      fontWeight: '600',
      color: '#000000',
      backgroundColor: '#00ff9d',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      boxShadow: '0 0 20px rgba(0, 255, 157, 0.2)',
    },
    uploadContainer: {
      position: 'absolute',
      zIndex: 999,
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '500px',
      backgroundColor: '#000000',
      boxShadow: '0 0 30px rgba(0, 0, 0, 0.3)',
      borderRadius: '16px',
      overflow: 'auto',
      maxHeight: 'calc(90% - 80px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }
  };

  return (
    <div style={styles.container}>
      <style jsx global>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
        }
      `}</style>
      <Navbar />
      <div style={styles.mapContainer}>
        <button onClick={() => setShowUpload((prev) => !prev)} style={styles.uploadButton}>
          {showUpload ? "Close Upload" : "Upload Audio"}
        </button>

        {showUpload && (
          <div style={styles.uploadContainer}>
            <UploadAudioPage />
          </div>
        )}

        <div style={styles.mapWrapper}>
          {mounted && (
            <MapContainer
              center={defaultPosition}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {markerIcon.default &&
                validAudioFiles.map((file, idx) => {
                  const isAccessible = file.isNearby && new Date(file.hidden_until) <= new Date();

                  const handlePlay = async () => {
                    try {
                      const response = await axios.get(`/audio/files/${audioId}/download`, {
                        responseType: 'blob',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                  
                      const audioBlob = response.data;
                      const audioUrl = URL.createObjectURL(audioBlob);
                      const audio = new Audio(audioUrl);
                      audio.play();
                    } catch (err) {
                      console.error("❌ Audio playback error:", err);
                      if (err.response) {
                        const status = err.response.status;
                  
                        // Read JSON from blob
                        const reader = new FileReader();
                        reader.onload = () => {
                          try {
                            const json = JSON.parse(reader.result);
                            console.error("📜 Server error message:", json.detail);
                  
                            if (status === 403) alert("🔒 Not authorized or still locked.");
                            else if (status === 404) alert("🚫 Audio not found.");
                            else alert("⚠️ Something went wrong.");
                          } catch (e) {
                            alert("⚠️ Unexpected error while reading server response.");
                          }
                        };
                        reader.readAsText(err.response.data);
                      } else {
                        alert("⚠️ Network or server error.");
                      }
                    }
                  };
                  
                  

                  return (
                    <Marker
                      key={`${file._id}-${idx}`}
                      position={[file.location.coordinates[1], file.location.coordinates[0]]}
                      icon={file.isNearby ? markerIcon.nearby : markerIcon.default}
                    >
                      <Popup>
                        <b>{file.file_name}</b><br />
                        <span style={{ color: file.isNearby ? "green" : "blue" }}>
                          {file.isNearby ? "✅ Nearby" : "📍 Not Nearby"}
                        </span><br />
                        Range: {file.range}m<br />
                        Hidden Until: {new Date(file.hidden_until).toLocaleString()}<br />
                        Created At: {new Date(file.created_at).toLocaleString()}<br /><br />

                        {isAccessible ? (
                          <button
                            onClick={handlePlay}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#00ff9d",
                              color: "#000",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            ▶️ Play Audio
                          </button>
                        ) : (
                          <span style={{ color: "#888" }}>🔒 Locked</span>
                        )}
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}

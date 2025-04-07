'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import UploadAudioPage from "../upload/page";
import Navbar from '@/components/Navbar';
import AudioPlayer from "@/components/Audioplayer";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });
const useMapEvents = dynamic(() => import("react-leaflet").then(mod => mod.useMapEvents), { ssr: false });

const defaultPosition = [12.9716, 77.5946];

export default function AudioMap() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [markerIcon, setMarkerIcon] = useState({ default: null, nearby: null });
  const [showUpload, setShowUpload] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null); // 📍 NEW

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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserPosition(coords);
          fetchAudioFiles(coords);
        },
        (error) => {
          console.error("Geolocation error:", error);
          fetchAudioFiles(null);
        }
      );
    } else {
      fetchAudioFiles(null);
    }
  }, []);

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async function fetchAudioFiles(userCoords) {
    const bearerToken = localStorage.getItem("authToken");

    try {
      const res = await axios.get("https://echo-trails-backend.vercel.app/audio/user/files", {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });

      const userFiles = res.data.audio_files || [];

      const enrichedFiles = userFiles.map((file) => {
        const [lng, lat] = file.location.coordinates;
        const distance = userCoords
          ? calculateDistance(userCoords.latitude, userCoords.longitude, lat, lng)
          : Infinity;
        const isNearby = distance <= file.range;
        return {
          ...file,
          isNearby,
          hidden_until: new Date(file.hidden_until).toLocaleString(),
          created_at: new Date(file.created_at).toLocaleString(),
        };
      });

      setAudioFiles(enrichedFiles);
    } catch (err) {
      console.error("❌ Error fetching audio files:", err);
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

  const handlePlay = async (audioId) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(`https://echo-trails-backend.vercel.app/audio/files/${audioId}/download`, {
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

  // 🌍 Map click handler
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ latitude: lat, longitude: lng });
      },
    });
    return null;
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
            <UploadAudioPage selectedLocation={selectedLocation} />
          </div>
        )}

        <div style={styles.mapWrapper}>
          {mounted && (
            <MapContainer
              center={defaultPosition}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <MapClickHandler />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              {selectedLocation && (
                <Marker position={[selectedLocation.latitude, selectedLocation.longitude]} icon={markerIcon.default}>
                  <Popup>📍 Selected Location for Upload</Popup>
                </Marker>
              )}

              {markerIcon.default &&
                validAudioFiles.map((file, idx) => {
                  const isTimeUnlocked = new Date(file.hidden_until) <= new Date();
                  const isAccessible = file.isNearby && isTimeUnlocked;

                  return (
                    <Marker
                      key={`${file._id}-${idx}`}
                      position={[file.location.coordinates[1], file.location.coordinates[0]]}
                      icon={file.isNearby ? markerIcon.nearby : markerIcon.default}
                    >
                      <Popup>
                        <b>{file.file_name}</b><br />
                        <b>{file.title}</b><br />
                        <span style={{ color: isAccessible ? "green" : file.isNearby ? "orange" : "blue" }}>
                          {isAccessible
                            ? "✅ Accessible"
                            : file.isNearby
                              ? "⏳ Nearby but Locked"
                              : "📍 Not Nearby"}
                        </span><br />
                        Range: {file.range}m<br />
                        Hidden Until: {new Date(file.hidden_until).toLocaleString()}<br />
                        Created At: {new Date(file.created_at).toLocaleString()}<br /><br />

                        {isAccessible ? (
                          <AudioPlayer audioId={file._id} />
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

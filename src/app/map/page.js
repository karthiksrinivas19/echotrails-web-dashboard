'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import UploadAudioPage from "../upload/page";
import Navbar from '@/components/Navbar';

// Dynamically import individual components
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const defaultPosition = [12.9716, 77.5946];

export default function AudioMap() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [markerIcon, setMarkerIcon] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const icon = new L.Icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      setMarkerIcon(icon);
    });

    async function fetchData() {
      const bearerToken = localStorage.getItem("authToken");
      try {
        const response = await axios.get("https://echo-trails-backend.vercel.app/audio/user/files", {
          headers: { Authorization: `Bearer ${bearerToken}` },
        });
        const allFiles = response.data.audio_files || [];
        setAudioFiles(allFiles);
      } catch (error) {
        console.error("❌ Error fetching audio files:", error);
      }
    }

    fetchData();
  }, []);

  const validAudioFiles = audioFiles.filter((file) =>
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
        <button
          onClick={() => setShowUpload((prev) => !prev)}
          style={styles.uploadButton}
        >
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
              {markerIcon && validAudioFiles.map((file, index) => (
                <Marker
                  key={`${file._id}-${index}`}
                  position={[
                    file.location.coordinates[1],
                    file.location.coordinates[0],
                  ]}
                  icon={markerIcon}
                >
                  <Popup>
                    <b>{file.file_name}</b> <br />
                    Range: {file.range}m <br />
                    Hidden Until: {new Date(file.hidden_until).toLocaleString()} <br />
                    Created At: {new Date(file.created_at).toLocaleString()}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}

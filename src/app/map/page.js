'use client';

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import UploadAudioPage from "../upload/page"; // Adjust path if needed

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const defaultPosition = [12.9716, 77.5946];

export default function AudioMap() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [markerIcon, setMarkerIcon] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
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

  return (
    <div className="h-screen w-screen relative">
      {/* Toggle Upload Button */}
      <div className="absolute top-4 left-4 z-[1000]">
        <button
          onClick={() => setShowUpload((prev) => !prev)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          {showUpload ? "Close Upload" : "Upload Audio"}
        </button>
      </div>

      {/* Upload Component (conditionally shown above the map) */}
      {showUpload && (
        <div className="absolute z-[999] top-20 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md bg-white shadow-lg rounded-lg overflow-auto max-h-[90%]">
          <UploadAudioPage />
        </div>
      )}

      {/* Map */}
      {typeof window !== 'undefined' && (
        <Suspense fallback={<div>Loading map...</div>}>
          <MapContainer center={defaultPosition} zoom={13} className="h-full w-full z-0">
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
        </Suspense>
      )}
    </div>
  );
}

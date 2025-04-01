"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// Default map position (Bangalore)
const defaultPosition = [12.9716, 77.5946];

// Your Bearer token
const bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2N2VhMGJkOTEyODJjNTY2YTlhMWM3OGYiLCJleHAiOjE3NDM1NjcwNDEsImlhdCI6MTc0MzQ4MDY0MX0.Zxa8231ScM3H0paXqfgEpYnzhmiA2N3uubkWQKwNDQo";

export default function AudioMap() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [markerIcon, setMarkerIcon] = useState(null);

  useEffect(() => {
    // Import Leaflet only on client-side
    import("leaflet").then((L) => {
      // Delete default icon's default locations
      delete L.Icon.Default.prototype._getIconUrl;
      
      // Set up default icon locations
      L.Icon.Default.mergeOptions({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      
      // Create custom icon if needed
      const icon = new L.Icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      
      setMarkerIcon(icon);
    });

    // Fetch audio files
    async function fetchData() {
      try {
        const response = await axios.get("https://echo-trails-backend.vercel.app/audio/user/files", {
          headers: { Authorization: `Bearer ${bearerToken}` },
        });
        setAudioFiles(response.data.audio_files || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    
    fetchData();
  }, []);

  return (
    <div className="h-screen w-screen">
      {typeof window !== 'undefined' && (
        <MapContainer center={defaultPosition} zoom={13} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {audioFiles.map((file) => (
            <Marker
              key={file._id}
              position={[file.location.coordinates[1], file.location.coordinates[0]]}
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
  );
}
'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function AudioPlayer({ audioId }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchAudio = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(`https://echo-trails-backend.vercel.app/audio/files/${audioId}/download`, {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        });

        const blob = response.data;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (err) {
        console.error("❌ Audio fetch error:", err);
        alert("Error loading audio.");
      }
    };

    fetchAudio();
  }, [audioId]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const seekTime = parseFloat(e.target.value);
    if (audio) {
      audio.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        hidden
      />

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={togglePlayback}
          style={{
            padding: "4px 10px",
            backgroundColor: "#00ff9d",
            color: "#000",
            fontWeight: "bold",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {isPlaying ? "⏸ Pause" : "▶️ Play"}
        </button>

        <span style={{ color: "#fff", fontSize: "12px" }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <input
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={currentTime}
        onChange={handleSeek}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function formatTime(sec) {
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
'use client';

import { useState, useEffect } from 'react';

export default function UploadAudioPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [range, setRange] = useState('');
  const [hiddenUntil, setHiddenUntil] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('range', range);
    formData.append('hidden_until', hiddenUntil);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage('Authentication token not found. Please log in.');
        return;
      }

      const response = await fetch('https://echo-trails-backend.vercel.app/audio/upload/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`Upload successful! Audio ID: ${result.id}`);
      } else {
        setMessage(`Upload failed: ${result.detail}`);
      }
    } catch (error) {
      setMessage('An error occurred while uploading.');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload Audio File</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="file" accept="audio/*" onChange={handleFileChange} className="block w-full" required />
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full border p-2" required />
        <p className="text-gray-600">Latitude: {latitude || 'Fetching...'}</p>
        <p className="text-gray-600">Longitude: {longitude || 'Fetching...'}</p>
        <input type="number" step="any" placeholder="Range" value={range} onChange={(e) => setRange(e.target.value)} className="block w-full border p-2" required />
        <input type="datetime-local" value={hiddenUntil} onChange={(e) => setHiddenUntil(e.target.value)} className="block w-full border p-2" required />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">Upload</button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}

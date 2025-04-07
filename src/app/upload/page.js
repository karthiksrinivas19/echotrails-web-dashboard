"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { MapPin, Mic, StopCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';

const AudioUploadForm = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [range, setRange] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [users, setUsers] = useState([]);
  const [recipientUsernames, setRecipientUsernames] = useState([]);
  const [currentUsername, setCurrentUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const router = useRouter();

  const fetchCurrentUserAndFollowing = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');

    if (!token || !username) {
      setError('Please login to continue.');
      router.push('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      setCurrentUsername(username);

      const usersRes = await axios.get('https://echo-trails-backend.vercel.app/users/following', { headers });
      if (usersRes.status === 200) {
        setUsers(usersRes.data);
      }

      // Check for selected location from map page
      const storedLocation = localStorage.getItem('selectedLocation');
      if (storedLocation) {
        const { lat, lng } = JSON.parse(storedLocation);
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        localStorage.removeItem('selectedLocation');
      } else {
        // If no location is provided, try to get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLatitude(position.coords.latitude.toString());
              setLongitude(position.coords.longitude.toString());
            },
            (error) => {
              console.error('Geolocation error:', error);
              setError('Could not get your location. Please enter coordinates manually or use the map.');
            }
          );
        } else {
          setError('Geolocation is not supported by your browser. Please enter coordinates manually or use the map.');
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      if (err.response?.status === 403) {
        setError('Your session has expired. Please login again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        router.push('/login');
      } else {
        setError('Failed to fetch user info. Please check your connection and try again.');
      }
    }
  }, [router]);

  useEffect(() => {
    fetchCurrentUserAndFollowing();
  }, [fetchCurrentUserAndFollowing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!file && !isRecording) || !range || !title || recipientUsernames.length === 0) {
      setError('Either a recorded or uploaded audio file, range, title, and at least one recipient are required.');
      return;
    }

    if (isRecording) {
      setError('Please stop the recording before submitting.');
      return;
    }

    // If no location is provided, try to get current location
    if (!latitude || !longitude) {
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        } catch (error) {
          setError('Could not get your location. Please enter coordinates manually or use the map.');
          return;
        }
      } else {
        setError('Geolocation is not supported by your browser. Please enter coordinates manually or use the map.');
        return;
      }
    }

    setError('');
    setMessage('');
    setLoading(true);

    const hiddenUntil = date && time 
      ? new Date(`${date}T${time}`) 
      : new Date(Date.now() + 1000*60*60*24*365);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('latitude', parseFloat(latitude));
    formData.append('longitude', parseFloat(longitude));
    formData.append('range', parseFloat(range));
    formData.append('hidden_until', hiddenUntil.toISOString());
    formData.append('recipient_usernames', recipientUsernames.join(','));

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'https://echo-trails-backend.vercel.app/audio/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        setMessage('Audio file uploaded successfully!');

        if (recipientUsernames.includes(currentUsername)) {
          const series = JSON.parse(localStorage.getItem('audioSeries')) || [];
          series.push({
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            range: parseFloat(range),
            hiddenUntil: hiddenUntil.toLocaleString(),
            audioId: response.data.audioId,
            recipients: recipientUsernames,
          });
          localStorage.setItem('audioSeries', JSON.stringify(series));
        }

        // Reset form
        setFile(null);
        setTitle('');
        setRange('');
        setDate('');
        setTime('');
        setRecipientUsernames([]);
        setLatitude('');
        setLongitude('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = () => {
    router.push('/map');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        setFile(audioFile);
        setAudioChunks([]);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = {
    container: {
      maxWidth: '480px',
      margin: '40px auto',
      padding: '60px',
      borderRadius: '24px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      backgroundColor: '#000000',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      minHeight: '600px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '20px',
    },
    label: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#ffffff',
      marginLeft: '4px',
    },
    input: {
      padding: '18px 20px',
      fontSize: '18px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#ffffff',
      height: '60px',
      outline: 'none',
    },
    locationButton: {
      padding: '18px 20px',
      fontSize: '18px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '20px',
      textDecoration: 'none',
      width: '100%',
    },
    locationInputs: {
      display: 'flex',
      gap: '12px',
    },
    locationInput: {
      flex: 1,
    },
    button: {
      padding: '20px',
      fontSize: '18px',
      fontWeight: '600',
      color: '#000000',
      backgroundColor: '#00ff9d',
      border: 'none',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      boxShadow: '0 0 20px rgba(0, 255, 157, 0.2)',
      height: '64px',
    },
    buttonDisabled: {
      backgroundColor: '#333333',
      cursor: 'not-allowed',
      color: '#666666',
      boxShadow: 'none',
    },
    error: {
      marginTop: '24px',
      textAlign: 'center',
      color: '#ff4d4d',
      fontSize: '16px',
      padding: '16px',
      borderRadius: '16px',
      backgroundColor: 'rgba(255, 77, 77, 0.1)',
      border: '1px solid rgba(255, 77, 77, 0.2)',
    },
    success: {
      marginTop: '24px',
      textAlign: 'center',
      color: '#4CAF50',
      fontSize: '16px',
      padding: '16px',
      borderRadius: '16px',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      border: '1px solid rgba(76, 175, 80, 0.2)',
    },
    dropdown: {
      position: 'relative',
      width: '100%',
    },
    dropdownList: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: '#000000',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      marginTop: '4px',
      maxHeight: '200px',
      overflowY: 'auto',
      zIndex: 1000,
    },
    dropdownItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      color: '#ffffff',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'background-color 0.2s',
    },
    selectedCount: {
      color: '#00ff9d',
      marginLeft: '8px',
    },
    recordingContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '20px',
    },
    recordingButton: {
      padding: '18px 20px',
      fontSize: '18px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '20px',
      textDecoration: 'none',
      width: '100%',
    },
    recordingTimer: {
      textAlign: 'center',
      color: '#00ff9d',
      fontSize: '24px',
      fontWeight: '600',
      margin: '10px 0',
    },
    recordingStatus: {
      textAlign: 'center',
      color: isRecording ? '#00ff9d' : '#ff4d4d',
      fontSize: '16px',
      marginBottom: '10px',
    },
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSelectUser = (username) => {
    if (recipientUsernames.includes(username)) {
      setRecipientUsernames(recipientUsernames.filter(u => u !== username));
    } else {
      setRecipientUsernames([...recipientUsernames, username]);
    }
  };

  return (
    <>
      <div style={styles.container}>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Audio File (Optional)</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={styles.input}
            />
          </div>

          <div style={styles.recordingContainer}>
            <label style={styles.label}>Record Audio (Optional)</label>
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                ...styles.recordingButton,
                backgroundColor: isRecording ? 'rgba(255, 77, 77, 0.1)' : 'rgba(0, 255, 157, 0.1)',
                border: isRecording ? '1px solid #ff4d4d' : '1px solid #00ff9d',
                color: isRecording ? '#ff4d4d' : '#00ff9d',
              }}
            >
              {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            {isRecording && (
              <div style={styles.recordingTimer}>
                {formatTime(recordingTime)}
              </div>
            )}
            {file && !isRecording && (
              <div style={styles.recordingStatus}>
                {file.name === 'recording.wav' ? 'Recording saved! Ready to upload.' : 'File selected! Ready to upload.'}
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter audio title"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Range (meters)</label>
            <input
              type="number"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder="Enter range in meters"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Location <span style={{ color: '#ff4d4d' }}>*</span></label>
            <div style={styles.locationInputs}>
              <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude"
                style={{ ...styles.input, ...styles.locationInput }}
                step="any"
                required
              />
              <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude"
                style={{ ...styles.input, ...styles.locationInput }}
                step="any"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleSelectLocation}
              style={{
                ...styles.locationButton,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#00ff9d',
                border: '1px solid #00ff9d',
              }}
            >
              <MapPin size={20} />
              Use Map to Select Location
            </button>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Recipients</label>
            <div style={styles.dropdown}>
              <button
                type="button"
                onClick={toggleDropdown}
                style={{
                  ...styles.input,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <span>
                  {recipientUsernames.length > 0
                    ? `${recipientUsernames.length} user(s) selected`
                    : 'Select recipients'}
                </span>
                <span style={styles.selectedCount}>
                  {recipientUsernames.length > 0 ? `(${recipientUsernames.length})` : ''}
                </span>
              </button>
              {dropdownOpen && (
                <div style={styles.dropdownList}>
                  {users.map((user) => (
                    <div
                      key={`user-${user._id}-${user.username}`}
                      onClick={() => handleSelectUser(user.username)}
                      style={{
                        ...styles.dropdownItem,
                        backgroundColor: recipientUsernames.includes(user.username)
                          ? 'rgba(0, 255, 157, 0.1)'
                          : 'transparent',
                      }}
                    >
                      {user.username}
                      {recipientUsernames.includes(user.username) && (
                        <span style={{ color: '#00ff9d', marginLeft: '8px' }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Hidden Until (Optional)</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={styles.input}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {message && <div style={styles.success}>{message}</div>}

          <button
            type="submit"
            disabled={loading || (!file && !isRecording) || !title || !range || recipientUsernames.length === 0 || !latitude || !longitude}
            style={{
              ...styles.button,
              ...((loading || (!file && !isRecording) || !title || !range || recipientUsernames.length === 0 || !latitude || !longitude) && styles.buttonDisabled)
            }}
          >
            {loading ? 'Uploading...' : 'Upload Audio'}
          </button>
        </form>
      </div>
    </>
  );
};

export default AudioUploadForm;
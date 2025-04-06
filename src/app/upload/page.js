"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar'; // Assuming Navbar is in components folder

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

  useEffect(() => {
    const fetchCurrentUserAndFollowing = async () => {
      const token = localStorage.getItem('authToken');
      const username = localStorage.getItem('username'); // Get username from localStorage
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Set current username from localStorage
        setCurrentUsername(username);

        // Get following users
        const usersRes = await axios.get('https://echo-trails-backend.vercel.app/users/following', { headers });
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user info. Please check your login.');
      }
    };

    fetchCurrentUserAndFollowing();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !range || !title || recipientUsernames.length === 0) {
      setError('All fields are required.');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const hiddenUntil = date && time 
        ? new Date(`${date}T${time}`) 
        : new Date(Date.now() + 1000*60*60*24*365);  // Default to 1 year in future

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('range', parseFloat(range)); // Convert range to float
      formData.append('hidden_until', hiddenUntil.toISOString());
      formData.append('recipient_usernames', recipientUsernames.join(','));

      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });

      console.log('File being uploaded:', file);

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
          console.log('Upload successful:', response.data);
          console.log('Upload response:', response.data);
          setMessage('Audio file uploaded successfully!');

          // Store lat, long, range, and audio ID in localStorage if recipientUsernames string includes currentUsername
          if (recipientUsernames.includes(currentUsername)) {
            const series = JSON.parse(localStorage.getItem('audioSeries')) || [];
            series.push({
              latitude,
              longitude,
              range: parseFloat(range),
              hiddenUntil: hiddenUntil.toISOString(),
              audioId: response.data.audioId, // Assuming response contains audioId
              recipients: recipientUsernames, // Store recipients as a string
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
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError(err.response?.data?.message || 'Error uploading file');
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Geolocation error:", err);
      setError("Location permission is required.");
      setLoading(false);
    });
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
    dropdown: {
      position: 'relative',
    },
    dropdownButton: {
      padding: '18px 20px',
      fontSize: '18px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#ffffff',
      cursor: 'pointer',
      textAlign: 'left',
    },
    dropdownList: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: '#000000',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      maxHeight: '200px',
      overflowY: 'auto',
      zIndex: 10,
    },
    dropdownItem: {
      padding: '12px 20px',
      fontSize: '16px',
      color: '#ffffff',
      cursor: 'pointer',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    dropdownItemHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSelectUser = (username) => {
    setRecipientUsernames((prev) =>
      prev.includes(username)
        ? prev.filter((user) => user !== username)
        : [...prev, username]
    );
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '20px' }}>Upload Audio</h1>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Audio File</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files[0])}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Range (meters)</label>
            <input
              type="number"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Send To</label>
            <div style={styles.dropdown}>
              <button
                type="button"
                style={styles.dropdownButton}
                onClick={toggleDropdown}
              >
                {recipientUsernames.length > 0
                  ? recipientUsernames.join(', ')
                  : 'Select recipients'}
              </button>
              {dropdownOpen && (
                <div style={styles.dropdownList}>
                  {currentUsername && (
                    <div
                      style={styles.dropdownItem}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = styles.dropdownItemHover.backgroundColor)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = styles.dropdownItem.backgroundColor)
                      }
                      onClick={() => handleSelectUser(currentUsername)}
                    >
                      Myself ({currentUsername})
                    </div>
                  )}
                  {users.map((user) => (
                    <div
                      key={user.id}
                      style={styles.dropdownItem}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = styles.dropdownItemHover.backgroundColor)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = styles.dropdownItem.backgroundColor)
                      }
                      onClick={() => handleSelectUser(user.username)}
                    >
                      {user.username}
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

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>

          {message && <p style={styles.success}>{message}</p>}
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </>
  );
};

export default AudioUploadForm;

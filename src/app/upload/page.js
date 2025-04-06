'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UploadAudioPage() {
    const [file, setFile] = useState(null);
    const [range, setRange] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [sendTo, setSendTo] = useState('public');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const bearerToken = localStorage.getItem('authToken');
                const response = await axios.get(
                    'https://echo-trails-backend.vercel.app/users',
                    {
                        headers: {
                            'Authorization': `Bearer ${bearerToken}`
                        }
                    }
                );
                setUsers(response.data || []);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };

        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const hiddenUntil = `${date}T${time}`;

        const formData = new FormData();
        formData.append('audio', file);
        formData.append('range', range);
        formData.append('hidden_until', hiddenUntil);
        formData.append('send_to', sendTo);

        try {
            const bearerToken = localStorage.getItem('authToken');
            const response = await axios.post(
                'https://echo-trails-backend.vercel.app/audio/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${bearerToken}`
                    }
                }
            );

            if (response.status === 201) {
                setMessage('Audio file uploaded successfully!');
                setFile(null);
                setRange('');
                setDate('');
                setTime('');
                setSendTo('public');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Error uploading file');
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
    const currentTime = now.toTimeString().slice(0, 5);

    const styles = {
        container: {
            padding: '32px',
            backgroundColor: '#000000',
            color: '#ffffff',
            borderRadius: '16px',
        },
        title: {
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px',
            textAlign: 'center',
            color: '#ffffff',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        },
        dateTimeGroup: {
            display: 'flex',
            gap: '12px',
        },
        dateTimeInput: {
            flex: 1,
        },
        label: {
            fontSize: '16px',
            fontWeight: '500',
            color: '#ffffff',
            marginLeft: '4px',
        },
        input: {
            padding: '14px 16px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            outline: 'none',
            width: '100%',
        },
        fileInput: {
            padding: '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '2px dashed rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            cursor: 'pointer',
            textAlign: 'center',
        },
        button: {
            padding: '16px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#000000',
            backgroundColor: '#00ff9d',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0, 255, 157, 0.2)',
        },
        buttonDisabled: {
            backgroundColor: '#333333',
            cursor: 'not-allowed',
            color: '#666666',
            boxShadow: 'none',
        },
        message: {
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '14px',
            backgroundColor: 'rgba(0, 255, 157, 0.1)',
            color: '#00ff9d',
            border: '1px solid rgba(0, 255, 157, 0.2)',
            marginTop: '16px',
        },
        error: {
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '14px',
            backgroundColor: 'rgba(255, 77, 77, 0.1)',
            color: '#ff4d4d',
            border: '1px solid rgba(255, 77, 77, 0.2)',
            marginTop: '16px',
        },
        select: {
            padding: '14px 16px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            outline: 'none',
            width: '100%',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1em',
        },
        option: {
            backgroundColor: '#000000',
            color: '#ffffff',
            padding: '8px',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Upload Audio</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Audio File</label>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                        style={styles.fileInput}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Send To</label>
                    <select 
                        value={sendTo}
                        onChange={(e) => setSendTo(e.target.value)}
                        style={styles.select}
                        required
                    >
                        <option value="public" style={styles.option}>Public</option>
                        <option value="private" style={styles.option}>Private</option>
                        <option value="friends" style={styles.option}>Friends Only</option>
                        {users.map(user => (
                            <option 
                                key={user.id} 
                                value={user.id}
                                style={styles.option}
                            >
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Range (in meters)</label>
                    <input
                        type="number"
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        required
                        placeholder="Enter range in meters"
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Hidden Until</label>
                    <div style={styles.dateTimeGroup}>
                        <div style={styles.dateTimeInput}>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={today}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.dateTimeInput}>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                                style={styles.input}
                                defaultValue={currentTime}
                                step="900"
                            />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    style={{
                        ...styles.button,
                        ...(loading ? styles.buttonDisabled : {})
                    }}
                    disabled={loading}
                >
                    {loading ? 'Uploading...' : 'Upload Audio'}
                </button>
            </form>

            {message && <div style={styles.message}>{message}</div>}
            {error && <div style={styles.error}>{error}</div>}
        </div>
    );
}

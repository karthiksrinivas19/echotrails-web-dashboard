"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const FollowRequestsPage = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPendingRequests(token);
  }, [router]);

  const fetchPendingRequests = async (token) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://echo-trails-backend.vercel.app/users/follow/requests/pending', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('Unexpected response:', errorText);
        throw new Error('Failed to fetch pending requests');
      }

      const data = await response.json();
      setPendingRequests(data);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requesterId, action) => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://echo-trails-backend.vercel.app/users/follow/${action}/${requesterId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('Unexpected response:', errorText);
        throw new Error(`Failed to ${action} follow request`);
      }

      alert(`Follow request ${action}ed successfully`);
      fetchPendingRequests(token);
    } catch (err) {
      console.error(`Error ${action}ing follow request:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
    title: {
      textAlign: 'center',
      marginBottom: '12px',
      color: '#ffffff',
      fontSize: '32px',
      fontWeight: '700',
    },
    list: {
      listStyle: 'none',
      padding: 0,
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    button: {
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#000000',
      backgroundColor: '#00ff9d',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    buttonReject: {
      backgroundColor: '#ff4d4d',
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
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Pending Follow Requests</h1>
      {error && <p style={styles.error}>{error}</p>}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#ffffff' }}>Loading...</p>
      ) : (
        <ul style={styles.list}>
          {pendingRequests.map((request) => (
            <li key={request.id} style={styles.listItem}>
              {request.username}
              <div>
                <button
                  style={styles.button}
                  onClick={() => handleAction(request.id, 'accept')}
                >
                  Accept
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonReject, marginLeft: '8px' }}
                  onClick={() => handleAction(request.id, 'reject')}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FollowRequestsPage;
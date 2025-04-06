'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react'; // optional: for the icon
import Navbar from '@/components/Navbar';

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;

      try {
        const res = await fetch('https://echo-trails-backend.vercel.app/users/identify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.status === 'success') {
          setUserData(data.user_data);
        }
      } catch (err) {
        console.error('❌ Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  if (loading) return (
    <>
      <Navbar />
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000'
      }}>
        <div style={{ color: '#00ff9d' }}>Loading profile...</div>
      </div>
    </>
  );

  if (!userData) return (
    <>
      <Navbar />
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000'
      }}>
        <div style={{ color: '#ff4d4d' }}>Failed to load profile.</div>
      </div>
    </>
  );

  const styles = {
    container: {
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: '#000000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
    },
    card: {
      maxWidth: '480px',
      width: '100%',
      padding: '60px',
      borderRadius: '24px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      backgroundColor: '#000000',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '40px',
    },
    title: {
      color: '#ffffff',
      fontSize: '32px',
      fontWeight: '700',
      marginLeft: '12px',
    },
    section: {
      marginBottom: '32px',
    },
    label: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#00ff9d',
      marginBottom: '8px',
    },
    value: {
      fontSize: '18px',
      color: '#ffffff',
      fontWeight: '400',
    },
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <User size={32} style={{ color: '#00ff9d' }} />
            <h1 style={styles.title}>Your Profile</h1>
          </div>

          <div style={styles.section}>
            <p style={styles.label}>Username</p>
            <p style={styles.value}>{userData.username}</p>
          </div>

          <div style={styles.section}>
            <p style={styles.label}>Email</p>
            <p style={styles.value}>{userData.email}</p>
          </div>

          <div style={styles.section}>
            <p style={styles.label}>Account Created</p>
            <p style={styles.value}>
              {new Date(userData.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

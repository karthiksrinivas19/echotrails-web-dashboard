'use client';

import { useEffect, useState } from 'react';
import { User, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLists, setLoadingLists] = useState(true);
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
          fetchFollowingAndFollowers(data.user_data._id);
        }
      } catch (err) {
        console.error('❌ Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFollowingAndFollowers = async (userId) => {
      try {
        setLoadingLists(true);
        const [followingRes, followersRes] = await Promise.all([
          fetch(`https://echo-trails-backend.vercel.app/users/following/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`https://echo-trails-backend.vercel.app/users/followers/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const [followingData, followersData] = await Promise.all([
          followingRes.json(),
          followersRes.json(),
        ]);

        setFollowing(followingData.following || []);
        setFollowers(followersData.followers || []);
      } catch (err) {
        console.error('❌ Error fetching following/followers:', err);
      } finally {
        setLoadingLists(false);
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
    listContainer: {
      marginTop: '16px',
      maxHeight: '200px',
      overflowY: 'auto',
      padding: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    listItemText: {
      color: '#ffffff',
      fontSize: '14px',
    },
    loadingText: {
      color: '#00ff9d',
      textAlign: 'center',
      padding: '16px',
    },
    emptyText: {
      color: '#ffffff',
      textAlign: 'center',
      padding: '16px',
      opacity: 0.7,
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

          <div style={styles.section}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Users size={20} style={{ color: '#00ff9d', marginRight: '8px' }} />
              <p style={styles.label}>Following ({following.length})</p>
            </div>
            <div style={styles.listContainer}>
              {loadingLists ? (
                <div style={styles.loadingText}>Loading...</div>
              ) : following.length === 0 ? (
                <div style={styles.emptyText}>Not following anyone yet</div>
              ) : (
                following.map((user) => (
                  <div key={user._id} style={styles.listItem}>
                    <span style={styles.listItemText}>{user.username}</span>
                    <span style={{ ...styles.listItemText, opacity: 0.7 }}>{user.email}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={styles.section}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Users size={20} style={{ color: '#00ff9d', marginRight: '8px' }} />
              <p style={styles.label}>Followers ({followers.length})</p>
            </div>
            <div style={styles.listContainer}>
              {loadingLists ? (
                <div style={styles.loadingText}>Loading...</div>
              ) : followers.length === 0 ? (
                <div style={styles.emptyText}>No followers yet</div>
              ) : (
                followers.map((user) => (
                  <div key={user._id} style={styles.listItem}>
                    <span style={styles.listItemText}>{user.username}</span>
                    <span style={{ ...styles.listItemText, opacity: 0.7 }}>{user.email}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { User, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [following, setFollowing] = useState([]);
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
          fetchFollowingAndFollowers(data.user_data.id);
        } else {
          console.error('❌ Failed to fetch user data:', data);
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
    
        const followingRes = await fetch(`https://echo-trails-backend.vercel.app/users/following`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        const followingData = await followingRes.json();
    
        console.log('✅ Following Response:', followingData);
        console.log('🔍 Following Users:', followingData.users);
    
        setFollowing(followingData || []);
      } catch (err) {
        console.error('❌ Error fetching following:', err);
      } finally {
        setLoadingLists(false);
      }
    };

    fetchUserData();
  }, [token]);

  const handleUnfollow = async (userId) => {
    try {
      const res = await fetch(`https://echo-trails-backend.vercel.app/users/unfollow`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        setFollowing((prevFollowing) => prevFollowing.filter((user) => user.id !== userId));
      } else {
        console.error('❌ Failed to unfollow user:', data);
      }
    } catch (err) {
      console.error('❌ Error unfollowing user:', err);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
        <div style={{ color: '#00ff9d' }}>Loading profile...</div>
      </div>
    </>
  );

  if (!userData) return (
    <>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
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
            <p style={styles.value}>{new Date(userData.created_at).toLocaleString()}</p>
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
                <div style={styles.emptyText}>You are not following anyone yet.</div>
              ) : (
                following.map((user) => (
                  <div key={user.id} style={styles.listItem}>
                    <span style={styles.listItemText}>{user.username}</span>
                    <button 
                      style={{
                        backgroundColor: '#ff4d4d',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleUnfollow(user.id)}
                    >
                      Remove
                    </button>
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

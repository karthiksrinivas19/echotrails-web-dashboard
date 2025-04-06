'use client';

import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function FollowPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    if (token) {
      fetchFollowingList();
    }
  }, [token]);

  const fetchFollowingList = async () => {
    try {
      setError(null);
      const res = await fetch('https://echo-trails-backend.vercel.app/users/following/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch following list');
      const data = await res.json();
      setFollowing(data.following || []);
    } catch (err) {
      console.error('❌ Error fetching following list:', err);
      setError('Failed to load following list. Please try again.');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://echo-trails-backend.vercel.app/users/search?query=${encodeURIComponent(searchTerm)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to search users');
      const data = await res.json();
      setSearchResults(data.users || []);
    } catch (err) {
      console.error('❌ Error searching users:', err);
      setError('Failed to search users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId) => {
    try {
      setError(null);
      const res = await fetch('https://echo-trails-backend.vercel.app/users/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ target_user_id: userId }),
      });
      if (!res.ok) throw new Error('Failed to follow user');
      await fetchFollowingList();
    } catch (err) {
      console.error('❌ Error following user:', err);
      setError('Failed to follow user. Please try again.');
    }
  };

  const unfollowUser = async (userId) => {
    try {
      setError(null);
      const res = await fetch('https://echo-trails-backend.vercel.app/users/unfollow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ target_user_id: userId }),
      });
      if (!res.ok) throw new Error('Failed to unfollow user');
      await fetchFollowingList();
    } catch (err) {
      console.error('❌ Error unfollowing user:', err);
      setError('Failed to unfollow user. Please try again.');
    }
  };

  const isFollowing = (userId) => {
    return following.some((user) => user._id === userId);
  };

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
      maxWidth: '600px',
      width: '100%',
      padding: '40px',
      borderRadius: '24px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      backgroundColor: '#000000',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '32px',
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
    searchContainer: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
    },
    searchInput: {
      flex: 1,
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#ffffff',
      fontSize: '16px',
    },
    searchButton: {
      padding: '12px 24px',
      borderRadius: '8px',
      backgroundColor: '#00ff9d',
      color: '#000000',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    listContainer: {
      marginTop: '16px',
      maxHeight: '300px',
      overflowY: 'auto',
      padding: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    listItemText: {
      color: '#ffffff',
      fontSize: '14px',
    },
    followButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s',
    },
    followButtonActive: {
      backgroundColor: '#00ff9d',
      color: '#000000',
    },
    unfollowButton: {
      backgroundColor: '#ff4d4d',
      color: '#ffffff',
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
    errorText: {
      color: '#ff4d4d',
      textAlign: 'center',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: 'rgba(255, 77, 77, 0.1)',
      borderRadius: '8px',
    },
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <Users size={32} style={{ color: '#00ff9d' }} />
            <h1 style={styles.title}>Search & Follow Users</h1>
          </div>

          {error && (
            <div style={styles.errorText}>
              {error}
            </div>
          )}

          {/* Search Section */}
          <div style={styles.section}>
            <div style={styles.searchContainer}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for users..."
                style={styles.searchInput}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                style={{
                  ...styles.searchButton,
                  opacity: loading || !searchTerm.trim() ? 0.5 : 1,
                }}
              >
                <Search size={20} />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div style={styles.section}>
            <p style={styles.label}>Search Results</p>
            <div style={styles.listContainer}>
              {loading ? (
                <div style={styles.loadingText}>Loading...</div>
              ) : searchResults.length === 0 ? (
                <div style={styles.emptyText}>No users found. Try searching with a different term.</div>
              ) : (
                searchResults.map((user) => (
                  <div key={user._id} style={styles.listItem}>
                    <div>
                      <span style={styles.listItemText}>{user.username}</span>
                      <span style={{ ...styles.listItemText, opacity: 0.7, display: 'block' }}>{user.email}</span>
                    </div>
                    {isFollowing(user._id) ? (
                      <button
                        onClick={() => unfollowUser(user._id)}
                        style={{ ...styles.followButton, ...styles.unfollowButton }}
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={() => followUser(user._id)}
                        style={{ ...styles.followButton, ...styles.followButtonActive }}
                      >
                        Follow
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Your Following */}
          <div style={styles.section}>
            <p style={styles.label}>You are Following ({following.length})</p>
            <div style={styles.listContainer}>
              {following.length === 0 ? (
                <div style={styles.emptyText}>Not following anyone yet</div>
              ) : (
                following.map((user) => (
                  <div key={user._id} style={styles.listItem}>
                    <div>
                      <span style={styles.listItemText}>{user.username}</span>
                      <span style={{ ...styles.listItemText, opacity: 0.7, display: 'block' }}>{user.email}</span>
                    </div>
                    <button
                      onClick={() => unfollowUser(user._id)}
                      style={{ ...styles.followButton, ...styles.unfollowButton }}
                    >
                      Unfollow
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


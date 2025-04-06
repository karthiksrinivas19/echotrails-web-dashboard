'use client'

import { useEffect, useState } from 'react'

const FollowRequestPage = () => {
  const [allUsers, setAllUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      try {
        const res = await fetch('https://echo-trails-backend.vercel.app/users/all', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (!res.ok) throw new Error('Failed to fetch users')

        const data = await res.json()
        setAllUsers(data)
        setFilteredUsers(data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = allUsers.filter(user =>
      user.username.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [search, allUsers])

  const handleFollow = async (username) => {
    const authToken = localStorage.getItem('authToken')
    if (!authToken) return

    try {
      const res = await fetch(`https://echo-trails-backend.vercel.app/users/follow/${username}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!res.ok) throw new Error('Failed to send follow request')

      alert(`Follow request sent to ${username}`)
    } catch (error) {
      console.error('Error sending follow request:', error)
      alert('Failed to send follow request')
    }
  }

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
    subtitle: {
      textAlign: 'center',
      color: '#a0a0a0',
      fontSize: '18px',
      marginBottom: '40px',
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
      marginBottom: '20px',
      width: '100%',
    },
    userList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    userItem: {
      padding: '18px',
      fontSize: '18px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    username: {
      fontSize: '18px',
      fontWeight: '500',
      color: '#ffffff',
    },
    followButton: {
      padding: '10px 20px',
      fontSize: '16px',
      fontWeight: '600',
      color: '#000000',
      backgroundColor: '#00ff9d',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Send Follow Requests</h1>
      <p style={styles.subtitle}>Search and select users to follow</p>
      <input
        type="text"
        placeholder="Search username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.input}
      />
      <div style={styles.userList}>
        {filteredUsers.map((user, index) => (
          <div key={index} style={styles.userItem}>
            <span style={styles.username}>{user.username}</span>
            <button
              style={styles.followButton}
              onClick={() => handleFollow(user.username)}
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FollowRequestPage

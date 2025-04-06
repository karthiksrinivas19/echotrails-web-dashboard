'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react'; // optional: for the icon

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

  if (loading) return <div className="p-4 text-center text-white">Loading profile...</div>;

  if (!userData) return <div className="p-4 text-center text-red-500">Failed to load profile.</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <div className="flex items-center mb-6">
        <User className="text-purple-800 mr-2" />
        <h1 className="text-2xl font-semibold text-purple-800">Your Profile</h1>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 font-semibold">Username:</p>
        <p className="text-gray-900">{userData.username}</p>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 font-semibold">Email:</p>
        <p className="text-gray-900">{userData.email}</p>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 font-semibold">Account Created At:</p>
        <p className="text-gray-900">{new Date(userData.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
}

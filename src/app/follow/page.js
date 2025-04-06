// 'use client';

// import { useEffect, useState } from 'react';

// export default function FollowPage() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [following, setFollowing] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

//   useEffect(() => {
//     if (token) {
//       fetchFollowingList();
//     }
//   }, [token]);

//   const fetchFollowingList = async () => {
//     try {
//       const res = await fetch('https://echo-trails-backend.vercel.app/users/following/me', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json();
//       setFollowing(data.following || []);
//     } catch (err) {
//       console.error('❌ Error fetching following list:', err);
//     }
//   };

//   const handleSearch = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`https://echo-trails-backend.vercel.app/users/search?query=${searchTerm}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json();
//       setSearchResults(data.users || []);
//     } catch (err) {
//       console.error('❌ Error searching users:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const followUser = async (userId) => {
//     try {
//       await fetch('https://echo-trails-backend.vercel.app/users/follow', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ target_user_id: userId }),
//       });
//       fetchFollowingList();
//     } catch (err) {
//       console.error('❌ Error following user:', err);
//     }
//   };

//   const unfollowUser = async (userId) => {
//     try {
//       await fetch('https://echo-trails-backend.vercel.app/users/unfollow', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ target_user_id: userId }),
//       });
//       fetchFollowingList();
//     } catch (err) {
//       console.error('❌ Error unfollowing user:', err);
//     }
//   };

//   const isFollowing = (userId) => {
//     return following.some((user) => user._id === userId);
//   };

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">👥 Search & Follow Users</h1>

//       {/* Search Section */}
//       <div className="flex gap-2 mb-6">
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Search for users..."
//           className="border px-4 py-2 rounded w-full"
//         />
//         <button
//           onClick={handleSearch}
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           Search
//         </button>
//       </div>

//       {/* Search Results */}
//       <div className="mb-8">
//         <h2 className="text-xl font-semibold mb-2">🔍 Results</h2>
//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           searchResults.map((user) => (
//             <div key={user._id} className="flex justify-between items-center border-b py-2">
//               <div>
//                 <strong>{user.username}</strong>
//                 <p className="text-sm text-gray-500">{user.email}</p>
//               </div>
//               {isFollowing(user._id) ? (
//                 <button
//                   onClick={() => unfollowUser(user._id)}
//                   className="text-white bg-red-500 px-3 py-1 rounded"
//                 >
//                   Unfollow
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => followUser(user._id)}
//                   className="text-white bg-green-600 px-3 py-1 rounded"
//                 >
//                   Follow
//                 </button>
//               )}
//             </div>
//           ))
//         )}
//       </div>

//       {/* Your Following */}
//       <div>
//         <h2 className="text-xl font-semibold mb-2">📋 You are Following</h2>
//         {following.length === 0 ? (
//           <p>No users followed yet.</p>
//         ) : (
//           following.map((user) => (
//             <div key={user._id} className="flex justify-between items-center border-b py-2">
//               <div>
//                 <strong>{user.username}</strong>
//                 <p className="text-sm text-gray-500">{user.email}</p>
//               </div>
//               <button
//                 onClick={() => unfollowUser(user._id)}
//                 className="text-white bg-red-500 px-3 py-1 rounded"
//               >
//                 Unfollow
//               </button>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }


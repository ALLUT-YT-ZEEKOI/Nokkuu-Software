import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Check, X, Send, Flame, Trophy, Sparkles, ChevronRight } from 'lucide-react';
import api from '../api/axios';

export const FriendsPage = ({ onOpenAssignTaskModal }) => {
  const [friends, setFriends] = useState([]);
  const [pendingIncoming, setPendingIncoming] = useState([]);
  const [pendingOutgoing, setPendingOutgoing] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedFriendProfile, setSelectedFriendProfile] = useState(null);

  const fetchFriendships = async () => {
    try {
      const res = await api.get('/friends');
      setFriends(res.data.friends || []);
      setPendingIncoming(res.data.pending_incoming || []);
      setPendingOutgoing(res.data.pending_outgoing || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendships();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;

    setSearching(true);
    try {
      const res = await api.get(`/friends/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (friendId) => {
    try {
      await api.post('/friends/request', { friend_id: friendId });
      fetchFriendships();
      setSearchResults(prev => prev.map(u => u.id === friendId ? { ...u, friendship_status: 'pending', is_sender: true } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespondRequest = async (friendshipId, action) => {
    try {
      await api.post(`/friends/request/${friendshipId}/respond`, { action });
      fetchFriendships();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewProfile = async (friendId) => {
    try {
      const res = await api.get(`/friends/${friendId}`);
      setSelectedFriendProfile(res.data.friend);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-purple-400 font-semibold animate-pulse">Loading Friends & Accountability Partners...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" /> Friends & Growth Partners
          </h1>
          <p className="text-xs text-slate-400 mt-1">Connect with friends, assign tasks & keep each other accountable</p>
        </div>

        <button
          onClick={onOpenAssignTaskModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:opacity-95 transition flex items-center space-x-2 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Assign Task to Friend</span>
        </button>
      </div>

      {/* User Search & Add Friends */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-indigo-400" /> Find & Add Growth Buddies
        </h3>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by name or email (e.g. Rahul, Sarah)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={searching || searchQuery.length < 2}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {searchResults.map((user) => (
              <div key={user.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl object-cover"
                  />
                  <div>
                    <div className="font-bold text-xs text-white">{user.name}</div>
                    <div className="text-[10px] text-slate-400">{user.email}</div>
                  </div>
                </div>

                {user.friendship_status === 'none' ? (
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                  >
                    + Add Friend
                  </button>
                ) : user.friendship_status === 'pending' ? (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-lg">
                    {user.is_sender ? 'Request Sent' : 'Pending Request'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg">
                    Friends ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests Section */}
      {pendingIncoming.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border border-amber-500/30 bg-amber-500/5">
          <h3 className="text-base font-bold text-amber-300 mb-3 flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Pending Friend Requests ({pendingIncoming.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingIncoming.map((req) => (
              <div key={req.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={req.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={req.user?.name}
                    className="w-9 h-9 rounded-xl object-cover"
                  />
                  <div>
                    <div className="font-bold text-xs text-white">{req.user?.name}</div>
                    <div className="text-[10px] text-slate-400">Sent you a friend request</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRespondRequest(req.id, 'accept')}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition"
                    title="Accept"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRespondRequest(req.id, 'reject')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" /> Active Friends ({friends.length})
        </h3>

        {friends.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl text-slate-400">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-base">You haven't added any friends yet.</p>
            <p className="text-xs text-slate-500 mt-1">Search above to find friends and assign accountability tasks!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <div key={friend.id} className="glass-panel rounded-3xl p-5 border border-white/10 flex flex-col justify-between hover:border-indigo-500/40 transition">
                <div>
                  <div className="flex items-center space-x-3.5 mb-4">
                    <img
                      src={friend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={friend.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-indigo-500/30"
                    />
                    <div>
                      <h4 className="font-bold text-base text-white">{friend.name}</h4>
                      <p className="text-xs text-indigo-400 font-semibold">Lvl {friend.level || 1} • {friend.title || 'Growth Scout'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-4">
                    {friend.bio || 'Building growth habits & completing daily tasks.'}
                  </p>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 mb-4">
                    <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold">
                      <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{friend.streak_count || 0}d Streak</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-purple-300 font-semibold">
                      <Trophy className="w-4 h-4 text-purple-400" />
                      <span>{friend.total_points || 0} XP</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                  <button
                    onClick={onOpenAssignTaskModal}
                    className="flex-1 py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold hover:bg-indigo-600/50 transition flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Assign Task</span>
                  </button>
                  <button
                    onClick={() => handleViewProfile(friend.id)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friend Profile Modal */}
      {selectedFriendProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl relative">
            <button
              onClick={() => setSelectedFriendProfile(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 mb-4">
              <img
                src={selectedFriendProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={selectedFriendProfile.name}
                className="w-14 h-14 rounded-2xl object-cover border border-indigo-500/40"
              />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedFriendProfile.name}</h3>
                <p className="text-xs text-indigo-400 font-semibold">Lvl {selectedFriendProfile.level} • {selectedFriendProfile.title}</p>
                <p className="text-xs text-slate-400 mt-1">{selectedFriendProfile.email}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-white/5 mb-4">
              {selectedFriendProfile.bio || 'No bio provided.'}
            </p>

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Public Goals ({(selectedFriendProfile.goals || []).length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
              {(selectedFriendProfile.goals || []).map(g => (
                <div key={g.id} className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate">{g.title}</span>
                  <span className="font-bold text-indigo-400">{g.progress_percentage}%</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setSelectedFriendProfile(null);
                onOpenAssignTaskModal();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg"
            >
              Assign Task To {selectedFriendProfile.name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

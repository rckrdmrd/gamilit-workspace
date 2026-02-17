/**
 * FriendsPage - Social Friends Management
 *
 * Features:
 * - Friends list with avatars and stats
 * - Friend requests (sent/received)
 * - Search users to add as friends
 * - Online status indicator
 * - Friend activities feed
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  UserCheck,
  UserX,
  Clock,
  Activity,
  Trophy,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

// Components
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { RankBadge } from '@shared/components/base/RankBadge';

// Hooks & Store
import { useFriends } from '@/features/gamification/social/hooks/useFriends';
import { useUserGamification } from '@shared/hooks/useUserGamification';

// Utils
import { cn } from '@shared/utils/cn';

type TabType = 'friends' | 'requests' | 'search' | 'activities';

export default function FriendsPage() {
  // Hooks
  const {
    friends,
    recommendations,
    activities,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    praiseActivity,
    getOnlineCount,
    getTotalFriends,
    getPendingRequests,
    // Search functionality for finding new friends
    searchUsers,
    searchQuery: userSearchQuery,
    searchLoading,
    filteredRecommendations,
  } = useFriends();

  // Local State
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friendsSearchQuery, setFriendsSearchQuery] = useState(''); // For filtering existing friends
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const { user, logout } = useAuth();

  // Use useUserGamification hook (currently with mock data until backend endpoint is ready)
  const { gamificationData } = useUserGamification(user?.id);

  // Filter friends based on search and online status
  const filteredFriends = friends.filter((friend) => {
    const matchesSearch = friend.username.toLowerCase().includes(friendsSearchQuery.toLowerCase());
    const matchesOnline = !showOnlineOnly || friend.isOnline;
    return matchesSearch && matchesOnline;
  });

  // Get pending requests
  const pendingRequests = getPendingRequests();

  // Format last active time
  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Handle friend request
  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
    // Show success notification
  };

  const handleAcceptRequest = async (requestId: string) => {
    await acceptFriendRequest(requestId);
  };

  const handleDeclineRequest = async (requestId: string) => {
    await declineFriendRequest(requestId);
  };

  const handleRemoveFriend = async (userId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      await removeFriend(userId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <GamifiedHeader
        user={user ?? undefined}
        gamificationData={gamificationData}
        onLogout={async () => {
          await logout();
          // No need to navigate - performLogout() handles redirect
        }}
      />

      <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold text-detective-text">
            <Users className="h-10 w-10 text-detective-orange" />
            Friends & Social
          </h1>
          <p className="text-detective-text-secondary">
            Connect with fellow detectives and track your friends' progress
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-detective-blue/20">
                <Users className="h-6 w-6 text-detective-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{getTotalFriends()}</p>
                <p className="text-sm text-detective-text-secondary">Total Friends</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{getOnlineCount()}</p>
                <p className="text-sm text-detective-text-secondary">Online Now</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-detective-orange/20">
                <Clock className="h-6 w-6 text-detective-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{pendingRequests.length}</p>
                <p className="text-sm text-detective-text-secondary">Pending Requests</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{recommendations.length}</p>
                <p className="text-sm text-detective-text-secondary">Recommendations</p>
              </div>
            </div>
          </DetectiveCard>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'friends' as TabType, label: 'My Friends', icon: Users, count: friends.length },
            {
              id: 'requests' as TabType,
              label: 'Requests',
              icon: UserPlus,
              count: pendingRequests.length,
            },
            { id: 'search' as TabType, label: 'Find Friends', icon: Search, count: 0 },
            {
              id: 'activities' as TabType,
              label: 'Activity Feed',
              icon: Activity,
              count: activities.length,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 font-semibold transition-all',
                  isActive
                    ? 'bg-detective-orange text-white shadow-lg'
                    : 'bg-white text-detective-text hover:bg-detective-bg',
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-bold',
                      isActive ? 'bg-white/20' : 'bg-detective-orange text-white',
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Friends List Tab */}
          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Search and Filter */}
              <DetectiveCard hoverable={false} className="mb-6">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search friends..."
                      value={friendsSearchQuery}
                      onChange={(e) => setFriendsSearchQuery(e.target.value)}
                      className="w-full rounded-lg border-2 border-detective-orange/30 py-2 pl-10 pr-4 focus:border-detective-orange focus:outline-none"
                    />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showOnlineOnly}
                      onChange={(e) => setShowOnlineOnly(e.target.checked)}
                      className="h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                    />
                    <span className="font-medium text-detective-text">Online Only</span>
                  </label>
                </div>
              </DetectiveCard>

              {/* Friends Grid */}
              {filteredFriends.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFriends.map((friend, index) => (
                    <motion.div
                      key={friend.userId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <DetectiveCard>
                        <div className="space-y-3">
                          {/* Friend Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-detective-orange to-detective-gold">
                                  <span className="text-lg font-bold text-white">
                                    {friend.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                {friend.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-detective-text">{friend.username}</h3>
                                <p className="text-xs text-detective-text-secondary">
                                  {friend.isOnline ? 'Online' : formatLastActive(friend.lastActive)}
                                </p>
                              </div>
                            </div>
                            <RankBadge rank={friend.rank} showIcon={false} />
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-lg bg-detective-bg p-2 text-center">
                              <Star className="mx-auto mb-1 h-4 w-4 text-yellow-500" />
                              <p className="text-sm font-bold text-detective-text">
                                Lvl {friend.level}
                              </p>
                            </div>
                            <div className="rounded-lg bg-detective-bg p-2 text-center">
                              <Zap className="mx-auto mb-1 h-4 w-4 text-detective-orange" />
                              <p className="text-sm font-bold text-detective-text">{friend.xp}</p>
                            </div>
                            <div className="rounded-lg bg-detective-bg p-2 text-center">
                              <Trophy className="mx-auto mb-1 h-4 w-4 text-detective-gold" />
                              <p className="text-sm font-bold text-detective-text">
                                {friend.mlCoins}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                /* Navigate to profile */
                              }}
                              className="hover:bg-detective-blue-dark flex-1 rounded-lg bg-detective-blue px-3 py-2 text-sm font-medium text-white transition-colors"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => handleRemoveFriend(friend.userId)}
                              className="rounded-lg bg-red-500 px-3 py-2 text-white transition-colors hover:bg-red-600"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </DetectiveCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <DetectiveCard hoverable={false}>
                  <div className="py-12 text-center">
                    <Users className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary/30" />
                    <h3 className="mb-2 text-xl font-bold text-detective-text">No Friends Found</h3>
                    <p className="mb-4 text-detective-text-secondary">
                      {userSearchQuery
                        ? 'Try a different search term'
                        : 'Start connecting with fellow detectives!'}
                    </p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="rounded-lg bg-detective-orange px-6 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark"
                    >
                      Find Friends
                    </button>
                  </div>
                </DetectiveCard>
              )}
            </motion.div>
          )}

          {/* Friend Requests Tab */}
          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <DetectiveCard key={request.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                            <span className="text-xl font-bold text-white">
                              {request.senderName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-detective-text">
                              {request.senderName}
                            </h3>
                            <div className="mt-1 flex items-center gap-2">
                              <RankBadge rank={request.senderRank} showIcon={false} />
                              <span className="text-sm text-detective-text-secondary">
                                Level {request.senderLevel}
                              </span>
                            </div>
                            {request.message && (
                              <p className="mt-2 text-sm text-detective-text-secondary">
                                "{request.message}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
                          >
                            <UserCheck className="h-4 w-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(request.id)}
                            className="flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-600"
                          >
                            <UserX className="h-4 w-4" />
                            Decline
                          </button>
                        </div>
                      </div>
                    </DetectiveCard>
                  ))}
                </div>
              ) : (
                <DetectiveCard hoverable={false}>
                  <div className="py-12 text-center">
                    <Clock className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary/30" />
                    <h3 className="mb-2 text-xl font-bold text-detective-text">
                      No Pending Requests
                    </h3>
                    <p className="text-detective-text-secondary">
                      You don't have any friend requests at the moment.
                    </p>
                  </div>
                </DetectiveCard>
              )}
            </motion.div>
          )}

          {/* Find Friends Tab */}
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Search Input */}
              <DetectiveCard hoverable={false} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => searchUsers(e.target.value)}
                    className="w-full rounded-lg border-2 border-detective-orange/30 py-3 pl-10 pr-4 text-lg focus:border-detective-orange focus:outline-none"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-detective-orange border-t-transparent" />
                    </div>
                  )}
                </div>
              </DetectiveCard>

              {/* Recommendations */}
              <h2 className="mb-4 text-2xl font-bold text-detective-text">
                {userSearchQuery ? 'Search Results' : 'Recommended Friends'}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRecommendations.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-detective-text-secondary">
                    {userSearchQuery
                      ? 'No users found matching your search'
                      : 'No friend recommendations available'}
                  </div>
                ) : (
                  filteredRecommendations.map((rec) => (
                  <DetectiveCard key={rec.userId}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-detective-blue to-purple-500">
                          <span className="text-lg font-bold text-white">
                            {rec.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-detective-text">{rec.username}</h3>
                          <RankBadge rank={rec.rank} showIcon={false} />
                        </div>
                      </div>

                      <p className="text-sm text-detective-text-secondary">{rec.reason}</p>

                      {rec.mutualFriends > 0 && (
                        <p className="text-xs text-detective-text-secondary">
                          {rec.mutualFriends} mutual friend{rec.mutualFriends > 1 ? 's' : ''}
                        </p>
                      )}

                      <button
                        onClick={() => handleSendRequest(rec.userId)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark"
                      >
                        <UserPlus className="h-4 w-4" />
                        Add Friend
                      </button>
                    </div>
                  </DetectiveCard>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <DetectiveCard key={activity.id} hoverable={false}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-detective-orange to-detective-gold">
                            <span className="font-bold text-white">
                              {activity.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-detective-text">
                              <span className="font-bold">{activity.username}</span>{' '}
                              {activity.description}
                            </p>
                            <p className="text-xs text-detective-text-secondary">
                              {formatLastActive(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => praiseActivity(activity.id)}
                          className={cn(
                            'rounded-lg px-3 py-2 transition-colors',
                            activity.praised
                              ? 'bg-detective-gold text-white'
                              : 'bg-detective-bg text-detective-text hover:bg-detective-gold hover:text-white',
                          )}
                        >
                          <Trophy className="h-5 w-5" />
                        </button>
                      </div>
                    </DetectiveCard>
                  ))}
                </div>
              ) : (
                <DetectiveCard hoverable={false}>
                  <div className="py-12 text-center">
                    <Activity className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary/30" />
                    <h3 className="mb-2 text-xl font-bold text-detective-text">
                      No Activities Yet
                    </h3>
                    <p className="text-detective-text-secondary">
                      Friend activities will appear here when they complete exercises and unlock
                      achievements.
                    </p>
                  </div>
                </DetectiveCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

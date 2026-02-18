import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthContext';
import { Users, UserPlus, Search, Activity } from 'lucide-react';

// Components
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { FriendsStatsGrid } from '../components/friends/FriendsStatsGrid';
import { FriendsListTab } from '../components/friends/FriendsListTab';
import { FriendRequestsTab } from '../components/friends/FriendRequestsTab';
import { FindFriendsTab } from '../components/friends/FindFriendsTab';
import { FriendActivitiesTab } from '../components/friends/FriendActivitiesTab';

// Hooks
import { useFriends } from '@/features/gamification/social/hooks/useFriends';
import { useUserGamification } from '@shared/hooks/useUserGamification';

// Utils
import { cn } from '@shared/utils/cn';

type TabType = 'friends' | 'requests' | 'search' | 'activities';

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

export default function FriendsPage() {
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
    searchUsers,
    searchQuery: userSearchQuery,
    searchLoading,
    filteredRecommendations,
  } = useFriends();

  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friendsSearchQuery, setFriendsSearchQuery] = useState('');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

  const pendingRequests = getPendingRequests();

  const handleRemoveFriend = async (userId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      await removeFriend(userId);
    }
  };

  const tabs = [
    { id: 'friends' as TabType, label: 'My Friends', icon: Users, count: friends.length },
    { id: 'requests' as TabType, label: 'Requests', icon: UserPlus, count: pendingRequests.length },
    { id: 'search' as TabType, label: 'Find Friends', icon: Search, count: 0 },
    { id: 'activities' as TabType, label: 'Activity Feed', icon: Activity, count: activities.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <GamifiedHeader
        user={user ?? undefined}
        gamificationData={gamificationData}
        onLogout={logout}
      />

      <main className="detective-container py-8">
        <div className="mb-8">
          <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold text-detective-text">
            <Users className="h-10 w-10 text-detective-orange" />
            Friends & Social
          </h1>
          <p className="text-detective-text-secondary">
            Connect with fellow detectives and track your friends' progress
          </p>
        </div>

        <FriendsStatsGrid
          totalFriends={getTotalFriends()}
          onlineCount={getOnlineCount()}
          pendingRequestsCount={pendingRequests.length}
          recommendationsCount={recommendations.length}
        />

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
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
          {activeTab === 'friends' && (
            <FriendsListTab
              friends={friends}
              searchQuery={friendsSearchQuery}
              onSearchChange={setFriendsSearchQuery}
              showOnlineOnly={showOnlineOnly}
              onShowOnlineOnlyChange={setShowOnlineOnly}
              onRemoveFriend={handleRemoveFriend}
              onSwitchToSearch={() => setActiveTab('search')}
              formatLastActive={formatLastActive}
            />
          )}

          {activeTab === 'requests' && (
            <FriendRequestsTab
              pendingRequests={pendingRequests}
              onAccept={acceptFriendRequest}
              onDecline={declineFriendRequest}
            />
          )}

          {activeTab === 'search' && (
            <FindFriendsTab
              searchQuery={userSearchQuery}
              onSearch={searchUsers}
              searchLoading={searchLoading}
              recommendations={filteredRecommendations}
              onSendRequest={sendFriendRequest}
            />
          )}

          {activeTab === 'activities' && (
            <FriendActivitiesTab
              activities={activities}
              onPraise={praiseActivity}
              formatLastActive={formatLastActive}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

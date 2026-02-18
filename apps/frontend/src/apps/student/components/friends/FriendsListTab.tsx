import { motion } from 'framer-motion';
import { Search, Users, UserX, Star, Zap, Trophy } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { RankBadge } from '@shared/components/base/RankBadge';
import type { Friend } from '@/features/gamification/social/types/friendsTypes';

interface FriendsListTabProps {
  friends: Friend[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showOnlineOnly: boolean;
  onShowOnlineOnlyChange: (value: boolean) => void;
  onRemoveFriend: (userId: string) => void;
  onSwitchToSearch: () => void;
  formatLastActive: (date: Date) => string;
}

export function FriendsListTab({
  friends,
  searchQuery,
  onSearchChange,
  showOnlineOnly,
  onShowOnlineOnlyChange,
  onRemoveFriend,
  onSwitchToSearch,
  formatLastActive,
}: FriendsListTabProps) {
  const filteredFriends = friends.filter((friend) => {
    const matchesSearch = friend.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = !showOnlineOnly || friend.isOnline;
    return matchesSearch && matchesOnline;
  });

  return (
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
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border-2 border-detective-orange/30 py-2 pl-10 pr-4 focus:border-detective-orange focus:outline-none"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => onShowOnlineOnlyChange(e.target.checked)}
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

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-detective-bg p-2 text-center">
                      <Star className="mx-auto mb-1 h-4 w-4 text-yellow-500" />
                      <p className="text-sm font-bold text-detective-text">Lvl {friend.level}</p>
                    </div>
                    <div className="rounded-lg bg-detective-bg p-2 text-center">
                      <Zap className="mx-auto mb-1 h-4 w-4 text-detective-orange" />
                      <p className="text-sm font-bold text-detective-text">{friend.xp}</p>
                    </div>
                    <div className="rounded-lg bg-detective-bg p-2 text-center">
                      <Trophy className="mx-auto mb-1 h-4 w-4 text-detective-gold" />
                      <p className="text-sm font-bold text-detective-text">{friend.mlCoins}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="hover:bg-detective-blue-dark flex-1 rounded-lg bg-detective-blue px-3 py-2 text-sm font-medium text-white transition-colors">
                      View Profile
                    </button>
                    <button
                      onClick={() => onRemoveFriend(friend.userId)}
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
              {searchQuery ? 'Try a different search term' : 'Start connecting with fellow detectives!'}
            </p>
            <button
              onClick={onSwitchToSearch}
              className="rounded-lg bg-detective-orange px-6 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark"
            >
              Find Friends
            </button>
          </div>
        </DetectiveCard>
      )}
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Search, UserPlus } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { RankBadge } from '@shared/components/base/RankBadge';
import type { FriendRecommendation } from '@/features/gamification/social/types/friendsTypes';

interface FindFriendsTabProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  searchLoading: boolean;
  recommendations: FriendRecommendation[];
  onSendRequest: (userId: string) => void;
}

export function FindFriendsTab({
  searchQuery,
  onSearch,
  searchLoading,
  recommendations,
  onSendRequest,
}: FindFriendsTabProps) {
  return (
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
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
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
        {searchQuery ? 'Search Results' : 'Recommended Friends'}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.length === 0 ? (
          <div className="col-span-full py-8 text-center text-detective-text-secondary">
            {searchQuery
              ? 'No users found matching your search'
              : 'No friend recommendations available'}
          </div>
        ) : (
          recommendations.map((rec) => (
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
                  onClick={() => onSendRequest(rec.userId)}
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
  );
}

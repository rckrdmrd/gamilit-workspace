import { motion } from 'framer-motion';
import { Clock, UserCheck, UserX } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { RankBadge } from '@shared/components/base/RankBadge';
import type { FriendRequest } from '@/features/gamification/social/types/friendsTypes';

interface FriendRequestsTabProps {
  pendingRequests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

export function FriendRequestsTab({ pendingRequests, onAccept, onDecline }: FriendRequestsTabProps) {
  return (
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
                        &quot;{request.message}&quot;
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAccept(request.id)}
                    className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
                  >
                    <UserCheck className="h-4 w-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => onDecline(request.id)}
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
            <h3 className="mb-2 text-xl font-bold text-detective-text">No Pending Requests</h3>
            <p className="text-detective-text-secondary">
              You don't have any friend requests at the moment.
            </p>
          </div>
        </DetectiveCard>
      )}
    </motion.div>
  );
}

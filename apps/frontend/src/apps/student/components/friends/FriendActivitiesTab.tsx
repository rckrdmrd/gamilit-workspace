import { motion } from 'framer-motion';
import { Activity, Trophy } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { FriendActivity } from '@/features/gamification/social/types/friendsTypes';
import { cn } from '@shared/utils/cn';

interface FriendActivitiesTabProps {
  activities: FriendActivity[];
  onPraise: (activityId: string) => void;
  formatLastActive: (date: Date) => string;
}

export function FriendActivitiesTab({ activities, onPraise, formatLastActive }: FriendActivitiesTabProps) {
  return (
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
                  onClick={() => onPraise(activity.id)}
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
            <h3 className="mb-2 text-xl font-bold text-detective-text">No Activities Yet</h3>
            <p className="text-detective-text-secondary">
              Friend activities will appear here when they complete exercises and unlock achievements.
            </p>
          </div>
        </DetectiveCard>
      )}
    </motion.div>
  );
}

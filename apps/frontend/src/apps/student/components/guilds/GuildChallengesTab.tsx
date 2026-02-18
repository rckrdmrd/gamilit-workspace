import { motion } from 'framer-motion';
import { Target, Trophy, Zap, Star, Calendar } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { GuildChallenge } from '@/features/gamification/social/types/guildsTypes';
import { cn } from '@shared/utils/cn';

interface GuildChallengesTabProps {
  challenges: GuildChallenge[];
  isInGuild: boolean;
}

export function GuildChallengesTab({ challenges, isInGuild }: GuildChallengesTabProps) {
  return (
    <motion.div
      key="challenges"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {challenges.length > 0 ? (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <DetectiveCard key={challenge.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-detective-text">{challenge.title}</h3>
                    <p className="text-detective-text-secondary">{challenge.description}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-sm font-bold',
                      challenge.type === 'collaborative'
                        ? 'bg-blue-500 text-white'
                        : 'bg-red-500 text-white',
                    )}
                  >
                    {challenge.type}
                  </span>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-detective-text">
                      Progress: {challenge.goal.current} / {challenge.goal.target}
                    </span>
                    <span className="text-sm text-detective-text-secondary">
                      {Math.round((challenge.goal.current / challenge.goal.target) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-detective-bg">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(challenge.goal.current / challenge.goal.target) * 100}%`,
                      }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-detective-orange to-detective-gold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-detective-gold">
                    <Trophy className="h-4 w-4" />
                    {challenge.rewards.mlCoins} ML
                  </span>
                  <span className="flex items-center gap-1 text-detective-orange">
                    <Zap className="h-4 w-4" />
                    {challenge.rewards.xp} XP
                  </span>
                  <span className="flex items-center gap-1 text-purple-600">
                    <Star className="h-4 w-4" />
                    {challenge.rewards.guildXp} Guild XP
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-detective-text-secondary">
                  <Calendar className="h-4 w-4" />
                  <span>Ends: {new Date(challenge.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </DetectiveCard>
          ))}
        </div>
      ) : (
        <DetectiveCard hoverable={false}>
          <div className="py-12 text-center">
            <Target className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary/30" />
            <h3 className="mb-2 text-xl font-bold text-detective-text">No Active Challenges</h3>
            <p className="text-detective-text-secondary">
              {isInGuild
                ? 'Your guild leaders can create new challenges'
                : 'Join a guild to participate in challenges'}
            </p>
          </div>
        </DetectiveCard>
      )}
    </motion.div>
  );
}

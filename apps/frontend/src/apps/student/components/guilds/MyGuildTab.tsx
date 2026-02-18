import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Star,
  Target,
  Trophy,
  Award,
  TrendingUp,
  LogOut as Leave,
  Crown,
} from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { RankBadge, type RankType } from '@shared/components/base/RankBadge';
import type { Guild, GuildMember } from '@/features/gamification/social/types/guildsTypes';

interface MyGuildTabProps {
  userGuild: Guild;
  guildMembers: GuildMember[];
  onLeaveGuild: () => void;
}

export function MyGuildTab({ userGuild, guildMembers, onLeaveGuild }: MyGuildTabProps) {
  return (
    <motion.div
      key="my-guild"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Guild Banner */}
      <DetectiveCard
        hoverable={false}
        className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{userGuild.name}</h2>
              <p className="text-white/90">{userGuild.description}</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {userGuild.memberCount} members
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Level {userGuild.level}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onLeaveGuild}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
          >
            <Leave className="h-4 w-4" />
            Leave Guild
          </button>
        </div>
      </DetectiveCard>

      {/* Guild Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { icon: Target, color: 'text-detective-orange', value: userGuild.stats.totalExercisesCompleted, label: 'Exercises' },
          { icon: Trophy, color: 'text-detective-gold', value: userGuild.stats.totalMlCoinsEarned, label: 'ML Coins' },
          { icon: Award, color: 'text-purple-600', value: userGuild.stats.totalAchievements, label: 'Achievements' },
          { icon: TrendingUp, color: 'text-green-600', value: `${userGuild.stats.averageScore}%`, label: 'Avg Score' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <DetectiveCard key={stat.label} hoverable={false}>
              <div className="text-center">
                <Icon className={`mx-auto mb-2 h-8 w-8 ${stat.color}`} />
                <p className="text-2xl font-bold text-detective-text">{stat.value}</p>
                <p className="text-sm text-detective-text-secondary">{stat.label}</p>
              </div>
            </DetectiveCard>
          );
        })}
      </div>

      {/* Members */}
      <h2 className="mb-4 text-2xl font-bold text-detective-text">Guild Members</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {guildMembers.map((member) => (
          <DetectiveCard key={member.userId}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-detective-orange to-detective-gold">
                  <span className="font-bold text-white">
                    {member.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-detective-text">{member.username}</h3>
                  <div className="flex items-center gap-2">
                    <RankBadge rank={member.rank as RankType} showIcon={false} />
                    {member.role === 'owner' && (
                      <Crown className="h-4 w-4 text-detective-gold" />
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-detective-text">
                  {member.contributionScore}
                </p>
                <p className="text-xs text-detective-text-secondary">Contribution</p>
              </div>
            </div>
          </DetectiveCard>
        ))}
      </div>
    </motion.div>
  );
}

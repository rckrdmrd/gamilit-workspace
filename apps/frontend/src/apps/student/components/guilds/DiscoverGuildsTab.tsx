import { motion } from 'framer-motion';
import { Search, Shield, Users, Star, Target, Trophy, Lock, UserPlus } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { StatusBadge } from '@shared/components/base/StatusBadge';
import type { StatusType } from '@shared/components/base/StatusBadge';
import type { Guild } from '@/features/gamification/social/types/guildsTypes';

interface DiscoverGuildsTabProps {
  guilds: Guild[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isInGuild: boolean;
  onJoinGuild: (guildId: string) => void;
}

const GUILD_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  recruiting: 'Recruiting',
  full: 'Full',
  inactive: 'Inactive',
};

function renderGuildStatusBadge(status: Guild['status']) {
  const validStatuses: StatusType[] = ['active', 'recruiting', 'full', 'inactive'];
  const statusType = validStatuses.includes(status as StatusType)
    ? (status as StatusType)
    : 'inactive';
  return (
    <StatusBadge
      status={statusType}
      label={GUILD_STATUS_LABELS[status] || status}
      size="sm"
    />
  );
}

export function DiscoverGuildsTab({
  guilds,
  searchQuery,
  onSearchChange,
  isInGuild,
  onJoinGuild,
}: DiscoverGuildsTabProps) {
  return (
    <motion.div
      key="discover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Search */}
      <DetectiveCard hoverable={false} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
          <input
            type="text"
            placeholder="Search guilds..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border-2 border-detective-orange/30 py-3 pl-10 pr-4 focus:border-detective-orange focus:outline-none"
          />
        </div>
      </DetectiveCard>

      {/* Guilds Grid */}
      {guilds.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guilds.map((guild) => (
            <DetectiveCard key={guild.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-detective-text">{guild.name}</h3>
                      <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                        <Users className="h-3 w-3" />
                        {guild.memberCount}/{guild.maxMembers} members
                      </p>
                    </div>
                  </div>
                  {renderGuildStatusBadge(guild.status)}
                </div>

                <p className="line-clamp-2 text-sm text-detective-text-secondary">
                  {guild.description}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-detective-bg p-2 text-center">
                    <Star className="mx-auto mb-1 h-4 w-4 text-yellow-500" />
                    <p className="text-sm font-bold text-detective-text">Lvl {guild.level}</p>
                  </div>
                  <div className="rounded-lg bg-detective-bg p-2 text-center">
                    <Target className="mx-auto mb-1 h-4 w-4 text-detective-orange" />
                    <p className="text-sm font-bold text-detective-text">
                      {guild.stats.totalExercisesCompleted}
                    </p>
                  </div>
                  <div className="rounded-lg bg-detective-bg p-2 text-center">
                    <Trophy className="mx-auto mb-1 h-4 w-4 text-detective-gold" />
                    <p className="text-sm font-bold text-detective-text">
                      {guild.stats.totalAchievements}
                    </p>
                  </div>
                </div>

                {guild.requirements?.minLevel && (
                  <div className="flex items-center gap-2 text-xs text-detective-text-secondary">
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Level {guild.requirements.minLevel}+
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  {!isInGuild && guild.status !== 'full' && (
                    <button
                      onClick={() => onJoinGuild(guild.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark"
                    >
                      <UserPlus className="h-4 w-4" />
                      Join
                    </button>
                  )}
                </div>
              </div>
            </DetectiveCard>
          ))}
        </div>
      ) : (
        <DetectiveCard hoverable={false}>
          <div className="py-12 text-center">
            <Search className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary/30" />
            <h3 className="mb-2 text-xl font-bold text-detective-text">No Guilds Found</h3>
            <p className="mb-4 text-detective-text-secondary">
              Try a different search term or create your own guild!
            </p>
          </div>
        </DetectiveCard>
      )}
    </motion.div>
  );
}

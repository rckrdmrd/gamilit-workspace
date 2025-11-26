/**
 * GuildsPage - Guild/Teams Management
 *
 * Features:
 * - Guild discovery/search
 * - Join/leave guild
 * - Guild details (members, challenges, leaderboard)
 * - Create new guild modal
 * - Guild chat/activities
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthContext';
import {
  Shield,
  Users,
  Plus,
  Search,
  Crown,
  Target,
  Trophy,
  TrendingUp,
  LogOut as Leave,
  UserPlus,
  Star,
  Lock,
  Award,
  Calendar,
  Zap,
} from 'lucide-react';

// Components
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { RankBadge } from '@shared/components/base/RankBadge';
import { Modal } from '@shared/components/common/Modal';

// Hooks & Store
import { useGuilds } from '@/features/gamification/social/hooks/useGuilds';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import type { Guild } from '@/features/gamification/social/types/guildsTypes';

// Utils
import { cn } from '@shared/utils/cn';

type TabType = 'discover' | 'my-guild' | 'challenges';

export default function GuildsPage() {
  // Hooks
  const {
    allGuilds,
    userGuild,
    guildMembers,
    isInGuild,
    joinGuild,
    leaveGuild,
    createGuild,
    getPublicGuilds,
    getRecruitingGuilds,
    getActiveChallenges,
    canJoinGuild,
  } = useGuilds();

  // Local State
  const [activeTab, setActiveTab] = useState<TabType>(isInGuild ? 'my-guild' : 'discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Guild Form
  const [newGuild, setNewGuild] = useState({
    name: '',
    description: '',
    isPublic: true,
    minLevel: 1,
  });

  const { user, logout } = useAuth();

  // Use useUserGamification hook (currently with mock data until backend endpoint is ready)
  const { gamificationData } = useUserGamification(user?.id);

  // Filter guilds
  const publicGuilds = getPublicGuilds();
  const recruitingGuilds = getRecruitingGuilds();
  const activeChallenges = getActiveChallenges();

  const filteredGuilds = publicGuilds.filter(
    (guild) =>
      guild.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guild.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle join guild
  const handleJoinGuild = async (guildId: string) => {
    if (canJoinGuild(guildId)) {
      await joinGuild(guildId);
      setActiveTab('my-guild');
    }
  };

  // Handle leave guild
  const handleLeaveGuild = async () => {
    if (confirm('Are you sure you want to leave your guild?')) {
      await leaveGuild();
      setActiveTab('discover');
    }
  };

  // Handle create guild
  const handleCreateGuild = async () => {
    if (!newGuild.name.trim()) {
      alert('Please enter a guild name');
      return;
    }

    await createGuild({
      name: newGuild.name,
      description: newGuild.description,
      isPublic: newGuild.isPublic,
      requirements: {
        minLevel: newGuild.minLevel,
      },
    });

    setShowCreateModal(false);
    setActiveTab('my-guild');
    setNewGuild({ name: '', description: '', isPublic: true, minLevel: 1 });
  };

  // Get guild status badge
  const getStatusBadge = (status: Guild['status']) => {
    const badges = {
      active: { color: 'bg-green-500', text: 'Active' },
      recruiting: { color: 'bg-blue-500', text: 'Recruiting' },
      full: { color: 'bg-yellow-500', text: 'Full' },
      inactive: { color: 'bg-gray-500', text: 'Inactive' },
    };
    const badge = badges[status];
    return (
      <span className={`${badge.color} rounded-full px-2 py-1 text-xs font-bold text-white`}>
        {badge.text}
      </span>
    );
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
            <Shield className="h-10 w-10 text-detective-orange" />
            Guilds & Teams
          </h1>
          <p className="text-detective-text-secondary">
            Join a guild to collaborate with other detectives and compete together
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{allGuilds.length}</p>
                <p className="text-sm text-detective-text-secondary">Total Guilds</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{recruitingGuilds.length}</p>
                <p className="text-sm text-detective-text-secondary">Recruiting</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-detective-orange/20">
                <Target className="h-6 w-6 text-detective-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{activeChallenges.length}</p>
                <p className="text-sm text-detective-text-secondary">Active Challenges</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-detective-gold/20">
                <Trophy className="h-6 w-6 text-detective-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">
                  {isInGuild ? userGuild?.level || 0 : 0}
                </p>
                <p className="text-sm text-detective-text-secondary">Guild Level</p>
              </div>
            </div>
          </DetectiveCard>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'discover' as TabType, label: 'Discover Guilds', icon: Search },
              { id: 'my-guild' as TabType, label: 'My Guild', icon: Shield, disabled: !isInGuild },
              { id: 'challenges' as TabType, label: 'Challenges', icon: Target },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.disabled;

              return (
                <motion.button
                  key={tab.id}
                  whileHover={!isDisabled ? { scale: 1.02 } : undefined}
                  whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 font-semibold transition-all',
                    isActive && !isDisabled
                      ? 'bg-detective-orange text-white shadow-lg'
                      : isDisabled
                        ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                        : 'bg-white text-detective-text hover:bg-detective-bg',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          {!isInGuild && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-detective-orange px-4 py-3 font-semibold text-white transition-colors hover:bg-detective-orange-dark"
            >
              <Plus className="h-5 w-5" />
              Create Guild
            </button>
          )}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Discover Tab */}
          {activeTab === 'discover' && (
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border-2 border-detective-orange/30 py-3 pl-10 pr-4 focus:border-detective-orange focus:outline-none"
                  />
                </div>
              </DetectiveCard>

              {/* Guilds Grid */}
              {filteredGuilds.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredGuilds.map((guild) => (
                    <DetectiveCard key={guild.id}>
                      <div className="space-y-4">
                        {/* Guild Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                              <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-detective-text">
                                {guild.name}
                              </h3>
                              <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                                <Users className="h-3 w-3" />
                                {guild.memberCount}/{guild.maxMembers} members
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(guild.status)}
                        </div>

                        <p className="line-clamp-2 text-sm text-detective-text-secondary">
                          {guild.description}
                        </p>

                        {/* Guild Stats */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg bg-detective-bg p-2 text-center">
                            <Star className="mx-auto mb-1 h-4 w-4 text-yellow-500" />
                            <p className="text-sm font-bold text-detective-text">
                              Lvl {guild.level}
                            </p>
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

                        {/* Requirements */}
                        {guild.requirements && (
                          <div className="flex items-center gap-2 text-xs text-detective-text-secondary">
                            {guild.requirements.minLevel && (
                              <span className="flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Level {guild.requirements.minLevel}+
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!isInGuild && guild.status !== 'full' && (
                            <button
                              onClick={() => handleJoinGuild(guild.id)}
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
          )}

          {/* My Guild Tab */}
          {activeTab === 'my-guild' && isInGuild && userGuild && (
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
                    onClick={handleLeaveGuild}
                    className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                  >
                    <Leave className="h-4 w-4" />
                    Leave Guild
                  </button>
                </div>
              </DetectiveCard>

              {/* Guild Stats */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <DetectiveCard hoverable={false}>
                  <div className="text-center">
                    <Target className="mx-auto mb-2 h-8 w-8 text-detective-orange" />
                    <p className="text-2xl font-bold text-detective-text">
                      {userGuild.stats.totalExercisesCompleted}
                    </p>
                    <p className="text-sm text-detective-text-secondary">Exercises</p>
                  </div>
                </DetectiveCard>
                <DetectiveCard hoverable={false}>
                  <div className="text-center">
                    <Trophy className="mx-auto mb-2 h-8 w-8 text-detective-gold" />
                    <p className="text-2xl font-bold text-detective-text">
                      {userGuild.stats.totalMlCoinsEarned}
                    </p>
                    <p className="text-sm text-detective-text-secondary">ML Coins</p>
                  </div>
                </DetectiveCard>
                <DetectiveCard hoverable={false}>
                  <div className="text-center">
                    <Award className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                    <p className="text-2xl font-bold text-detective-text">
                      {userGuild.stats.totalAchievements}
                    </p>
                    <p className="text-sm text-detective-text-secondary">Achievements</p>
                  </div>
                </DetectiveCard>
                <DetectiveCard hoverable={false}>
                  <div className="text-center">
                    <TrendingUp className="mx-auto mb-2 h-8 w-8 text-green-600" />
                    <p className="text-2xl font-bold text-detective-text">
                      {userGuild.stats.averageScore}%
                    </p>
                    <p className="text-sm text-detective-text-secondary">Avg Score</p>
                  </div>
                </DetectiveCard>
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
                            <RankBadge rank={member.rank as any} showIcon={false} />
                            {member.role === 'leader' && (
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
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {activeChallenges.length > 0 ? (
                <div className="space-y-4">
                  {activeChallenges.map((challenge) => (
                    <DetectiveCard key={challenge.id}>
                      <div className="space-y-4">
                        {/* Challenge Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-detective-text">
                              {challenge.title}
                            </h3>
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

                        {/* Progress */}
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

                        {/* Rewards */}
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

                        {/* Date */}
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
                    <h3 className="mb-2 text-xl font-bold text-detective-text">
                      No Active Challenges
                    </h3>
                    <p className="text-detective-text-secondary">
                      {isInGuild
                        ? 'Your guild leaders can create new challenges'
                        : 'Join a guild to participate in challenges'}
                    </p>
                  </div>
                </DetectiveCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Guild Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Guild"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Guild Name *
              </label>
              <input
                type="text"
                value={newGuild.name}
                onChange={(e) => setNewGuild({ ...newGuild, name: e.target.value })}
                className="w-full rounded-lg border-2 border-detective-orange/30 px-4 py-2 focus:border-detective-orange focus:outline-none"
                placeholder="Enter guild name..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Description
              </label>
              <textarea
                value={newGuild.description}
                onChange={(e) => setNewGuild({ ...newGuild, description: e.target.value })}
                className="w-full rounded-lg border-2 border-detective-orange/30 px-4 py-2 focus:border-detective-orange focus:outline-none"
                rows={3}
                placeholder="Describe your guild..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Minimum Level Requirement
              </label>
              <input
                type="number"
                min="1"
                value={newGuild.minLevel}
                onChange={(e) =>
                  setNewGuild({ ...newGuild, minLevel: parseInt(e.target.value) || 1 })
                }
                className="w-full rounded-lg border-2 border-detective-orange/30 px-4 py-2 focus:border-detective-orange focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={newGuild.isPublic}
                onChange={(e) => setNewGuild({ ...newGuild, isPublic: e.target.checked })}
                className="h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
              />
              <label htmlFor="isPublic" className="text-sm text-detective-text">
                Make guild public (anyone can join)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-detective-text transition-colors hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGuild}
                className="flex-1 rounded-lg bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark"
              >
                Create Guild
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Target, Plus } from 'lucide-react';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';

// Components
import { StudentPageShell } from '../components/shared/StudentPageShell';
import { GuildStatsGrid } from '../components/guilds/GuildStatsGrid';
import { DiscoverGuildsTab } from '../components/guilds/DiscoverGuildsTab';
import { MyGuildTab } from '../components/guilds/MyGuildTab';
import { GuildChallengesTab } from '../components/guilds/GuildChallengesTab';
import { CreateGuildModal } from '../components/guilds/CreateGuildModal';

// Hooks
import { useGuilds } from '@/features/gamification/social/hooks/useGuilds';

// Utils
import { cn } from '@shared/utils/cn';

type TabType = 'discover' | 'my-guild' | 'challenges';

export default function GuildsPage() {
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

  const [activeTab, setActiveTab] = useState<TabType>(isInGuild ? 'my-guild' : 'discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const publicGuilds = getPublicGuilds();
  const recruitingGuilds = getRecruitingGuilds();
  const activeChallenges = getActiveChallenges();

  const filteredGuilds = publicGuilds.filter(
    (guild) =>
      guild.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guild.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleJoinGuild = async (guildId: string) => {
    if (canJoinGuild(guildId)) {
      await joinGuild(guildId);
      setActiveTab('my-guild');
    }
  };

  const handleLeaveGuild = useCallback(() => {
    setShowLeaveConfirm(true);
  }, []);

  const handleConfirmLeave = useCallback(async () => {
    await leaveGuild();
    setShowLeaveConfirm(false);
    setActiveTab('discover');
  }, [leaveGuild]);

  const handleCreateGuild = async (data: { name: string; description: string; isPublic: boolean; requirements: { minLevel: number } }) => {
    await createGuild(data);
    setShowCreateModal(false);
    setActiveTab('my-guild');
  };

  const tabs = [
    { id: 'discover' as TabType, label: 'Discover Guilds', icon: Search },
    { id: 'my-guild' as TabType, label: 'My Guild', icon: Shield, disabled: !isInGuild },
    { id: 'challenges' as TabType, label: 'Challenges', icon: Target },
  ];

  return (
    <StudentPageShell>
      <main className="detective-container py-8">
        <div className="mb-8">
          <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold text-detective-text">
            <Shield className="h-10 w-10 text-detective-orange" />
            Guilds & Teams
          </h1>
          <p className="text-detective-text-secondary">
            Join a guild to collaborate with other detectives and compete together
          </p>
        </div>

        <GuildStatsGrid
          totalGuilds={allGuilds.length}
          recruitingCount={recruitingGuilds.length}
          activeChallengesCount={activeChallenges.length}
          guildLevel={isInGuild ? userGuild?.level || 0 : 0}
        />

        {/* Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto" role="tablist" aria-label="Secciones de gremios">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.disabled;
              return (
                <motion.button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
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
        <div role="tabpanel" aria-live="polite">
        <AnimatePresence mode="wait">
          {activeTab === 'discover' && (
            <DiscoverGuildsTab
              guilds={filteredGuilds}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isInGuild={isInGuild}
              onJoinGuild={handleJoinGuild}
            />
          )}

          {activeTab === 'my-guild' && isInGuild && userGuild && (
            <MyGuildTab
              userGuild={userGuild}
              guildMembers={guildMembers}
              onLeaveGuild={handleLeaveGuild}
            />
          )}

          {activeTab === 'challenges' && (
            <GuildChallengesTab
              challenges={activeChallenges}
              isInGuild={isInGuild}
            />
          )}
        </AnimatePresence>
        </div>

        <CreateGuildModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGuild}
        />

        <ConfirmDialog
          isOpen={showLeaveConfirm}
          onClose={() => setShowLeaveConfirm(false)}
          onConfirm={handleConfirmLeave}
          title="Abandonar gremio"
          message="¿Estás seguro de que deseas abandonar tu gremio? Perderás tu membresía y progreso en el gremio."
          confirmText="Abandonar"
          cancelText="Cancelar"
          variant="danger"
        />
      </main>
    </StudentPageShell>
  );
}

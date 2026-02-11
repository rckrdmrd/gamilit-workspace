export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  score: number;
  rankBadge: string;
  change: number;
  changeType: 'up' | 'down' | 'same' | 'new';
  isCurrentUser: boolean;
}

export interface LeaderboardPosition {
  position: number;
  totalUsers: number;
  percentile: number;
  entry: LeaderboardEntry;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  progress: number;
  required: number;
  reward: {
    coins: number;
    xp: number;
  };
  expiresAt: string;
  completed: boolean;
  claimed: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakHistory: {
    date: string;
    active: boolean;
  }[];
}

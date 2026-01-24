# GamifiedHeader Policy - Student Portal

## Overview

This document defines the policy for using the `GamifiedHeader` component across Student Portal pages.

## Component Location

```
@shared/components/layout/GamifiedHeader.tsx
```

## Standard Usage Pattern

All student portal pages that require GamifiedHeader should follow this pattern:

```tsx
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { useAuth } from '@/app/providers/AuthContext';  // or @/features/auth/hooks/useAuth
import { useUserGamification } from '@shared/hooks/useUserGamification';

export default function SomePage() {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <GamifiedHeader
        user={user ?? undefined}
        gamificationData={gamificationData}
        onLogout={async () => {
          await logout();
        }}
      />

      <main className="detective-container py-8">
        {/* Page content */}
      </main>
    </div>
  );
}
```

## Pages Classification

### Pages that SHOULD have GamifiedHeader (17 pages)

These are authenticated student pages that display gamification data:

| Page | Reason |
|------|--------|
| AssignmentDetailPage | Displays assignment with gamification context |
| AssignmentsPage | Student hub page |
| DashboardComplete | Main dashboard |
| EnhancedProfilePage | Profile with gamification stats |
| ExercisePage | Exercise execution with XP/coins |
| FriendsPage | Social features |
| GamificationPage | Gamification dashboard |
| GuildsPage | Social/guild features |
| InventoryPage | Economy/items management |
| LeaderboardPage | Rankings and competition |
| MissionsPage | Daily/weekly missions |
| ModuleDetailPage | Module progress with XP |
| NotificationPreferencesPage | Settings page (needs navigation context) |
| NotificationsPage | Notifications management |
| ProfilePage | Basic profile |
| SettingsPage | User settings |
| ShopPage | ML Coins economy |

### Pages that should NOT have GamifiedHeader (5 pages)

| Page | Reason |
|------|--------|
| EmailVerificationPage | Auth flow - deprecated, simple landing |
| NotFoundPage | Error page - minimal UI |
| PasswordRecoveryPage | Auth flow - unauthenticated |
| PasswordResetPage | Auth flow - unauthenticated |
| TwoFactorAuthPage | Auth flow - verification step |

### Components (not pages)

| Component | Reason |
|-----------|--------|
| DeviceManagementSection | Section component embedded in other pages |

## Props Reference

```tsx
interface GamifiedHeaderProps {
  user?: User;                           // Current authenticated user
  onLogout?: () => void;                 // Logout handler
  gamificationData?: UserGamificationData | null;  // XP, level, coins, rank
  organizationName?: string;             // Optional organization display
}
```

## Required Hooks

1. **useAuth** - Provides `user` and `logout`
   - From: `@/app/providers/AuthContext` or `@/features/auth/hooks/useAuth`

2. **useUserGamification** - Provides real-time gamification data
   - From: `@shared/hooks/useUserGamification`
   - Fetches from: `GET /api/v1/gamification/users/:userId/summary`

## Maintenance

When creating new student pages:

1. Check this policy to determine if GamifiedHeader is needed
2. If YES: Copy the standard usage pattern above
3. If NO: Document the reason in the "Pages that should NOT have" section
4. Update this document if adding new pages

## Last Updated

- Date: 2026-01-24
- Task: GAP-M-003
- Changes: Initial policy creation after audit of 23 pages

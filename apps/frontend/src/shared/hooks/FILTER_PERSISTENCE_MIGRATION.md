# Filter Persistence Migration Guide

## Current Implementation (localStorage)

The current implementation uses `usePersistedFilters` hook with localStorage for client-side persistence.

### Pros
- No network requests required
- Works offline
- Fast and responsive
- No backend dependencies

### Cons
- No cross-device synchronization
- Data lost if localStorage is cleared
- Limited storage space
- No backup/recovery

## Future Migration: Backend User Preferences

### Overview

The backend already has a user preferences system that can be used to store filter preferences across devices.

**Backend Endpoints Available:**
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update user preferences

**Backend Entity:**
```typescript
// apps/backend/src/modules/auth/entities/user-preferences.entity.ts
@Entity({ name: 'user_preferences', schema: 'auth_management' })
export class UserPreferences {
  @PrimaryColumn('uuid', { name: 'user_id' })
  user_id!: string;

  // ... other fields (theme, language, notifications)

  @Column({ type: 'jsonb', default: {} })
  @Index('idx_user_preferences_preferences')
  preferences!: Record<string, any>; // <-- Store filters here
}
```

### Migration Strategy

#### Phase 1: Hybrid Approach (Recommended)

Use localStorage as cache with backend as source of truth:

```typescript
// New hook: usePersistedFiltersWithSync
export function usePersistedFiltersWithSync<T>({
  storageKey,
  defaultFilters,
  version,
  backendKey, // e.g., 'achievements_filters'
  syncInterval = 60000, // Sync every 60 seconds
}) {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<T>(defaultFilters);

  // Load from localStorage first (instant)
  useEffect(() => {
    const cached = loadFromLocalStorage(storageKey);
    if (cached) setFilters(cached);
  }, []);

  // Sync with backend
  useEffect(() => {
    if (!user?.id) return;

    const syncWithBackend = async () => {
      try {
        // Fetch from backend
        const response = await fetch('/api/users/preferences');
        const { preferences } = await response.json();

        if (preferences[backendKey]) {
          const backendFilters = preferences[backendKey];

          // Check version
          if (backendFilters.version === version) {
            setFilters(backendFilters.filters);
            saveToLocalStorage(storageKey, backendFilters);
          }
        }
      } catch (error) {
        console.error('Failed to sync filters:', error);
      }
    };

    syncWithBackend();
    const interval = setInterval(syncWithBackend, syncInterval);
    return () => clearInterval(interval);
  }, [user?.id, backendKey, version]);

  // Save to backend on change (debounced)
  useEffect(() => {
    if (!user?.id) return;

    const timeout = setTimeout(async () => {
      try {
        await fetch('/api/users/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: {
              [backendKey]: {
                filters,
                version,
                timestamp: Date.now(),
              }
            }
          })
        });
      } catch (error) {
        console.error('Failed to save filters to backend:', error);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [filters, user?.id, backendKey, version]);

  return { filters, updateFilter, updateFilters, resetFilters };
}
```

#### Phase 2: Backend-First

Once confident in backend reliability:

1. Remove localStorage dependency
2. Add optimistic updates
3. Implement conflict resolution for concurrent edits

### Implementation Checklist

- [ ] Create `usePersistedFiltersWithSync` hook
- [ ] Add debouncing for backend saves (avoid excessive API calls)
- [ ] Implement retry logic for failed syncs
- [ ] Add loading states for initial fetch
- [ ] Handle offline scenarios gracefully
- [ ] Test with slow network connections
- [ ] Add analytics to monitor sync failures
- [ ] Create migration script for existing localStorage data
- [ ] Update documentation

### Data Structure in Backend

Store filters in the `preferences` JSONB column:

```json
{
  "achievements_filters": {
    "filters": {
      "category": "all",
      "lockedFilter": "all",
      "sortBy": "date"
    },
    "version": "1.0.0",
    "timestamp": 1701234567890
  },
  "leaderboard_filters": {
    "filters": {
      "timeRange": "week",
      "category": "all"
    },
    "version": "1.0.0",
    "timestamp": 1701234567890
  }
}
```

### Performance Considerations

1. **Caching Strategy**
   - Use localStorage as L1 cache
   - Backend as source of truth
   - Sync on page load and periodically

2. **Network Optimization**
   - Debounce saves (2-5 seconds)
   - Batch multiple filter updates
   - Use ETag for conditional fetches

3. **Error Handling**
   - Graceful degradation to localStorage-only mode
   - Queue failed syncs for retry
   - Show user sync status if needed

### Migration Path

1. **Week 1-2**: Implement `usePersistedFiltersWithSync` hook
2. **Week 3**: Test with AchievementsPage
3. **Week 4**: Roll out to other pages
4. **Week 5**: Monitor metrics and fix issues
5. **Week 6**: Remove old localStorage-only code

### Rollback Plan

If backend sync causes issues:

1. Feature flag to disable backend sync
2. Keep localStorage as fallback
3. Can revert to current implementation instantly

### Testing Strategy

- [ ] Unit tests for sync logic
- [ ] Integration tests with mock API
- [ ] E2E tests for cross-device sync
- [ ] Performance tests for sync overhead
- [ ] Offline behavior tests
- [ ] Concurrent edit conflict tests

### Security Considerations

- User preferences already protected by JWT auth
- No sensitive data in filters
- JSONB column indexed for performance
- RLS policies in place (if applicable)

---

## Quick Reference

### Current Usage (localStorage only)
```typescript
const { filters, updateFilter } = usePersistedFilters({
  storageKey: 'achievements-filters',
  defaultFilters: DEFAULT_FILTERS,
  version: '1.0.0',
});
```

### Future Usage (with backend sync)
```typescript
const { filters, updateFilter, isSyncing } = usePersistedFiltersWithSync({
  storageKey: 'achievements-filters',
  backendKey: 'achievements_filters',
  defaultFilters: DEFAULT_FILTERS,
  version: '1.0.0',
  syncInterval: 60000, // Optional: 60s default
});
```

---

**Created**: 2025-11-28
**Issue**: P2-002 - Local Filter Storage Without Synchronization
**Status**: Planning / Not Implemented
**Priority**: Medium (Nice to Have)

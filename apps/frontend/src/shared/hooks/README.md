# Shared Hooks

This directory contains reusable React hooks used across the GLIT platform.

## Available Hooks

### `usePersistedFilters`

A robust hook for managing filter state with localStorage persistence and versioning.

**Features:**
- Type-safe filter state management
- Automatic localStorage persistence
- Schema versioning to invalidate obsolete data
- Optional validation function
- Automatic migration when new filter fields are added
- Error handling with graceful fallback to defaults
- Debug mode for development

**Basic Usage:**

```typescript
import { usePersistedFilters } from '@/shared/hooks';

interface MyFilters {
  category: string;
  status: 'all' | 'active' | 'inactive';
  sortBy: string;
}

const defaultFilters: MyFilters = {
  category: 'all',
  status: 'all',
  sortBy: 'date'
};

function MyComponent() {
  const { filters, updateFilter, updateFilters, resetFilters } = usePersistedFilters({
    storageKey: 'my-page-filters',
    defaultFilters,
    version: '1.0.0',
  });

  return (
    <div>
      <select
        value={filters.category}
        onChange={(e) => updateFilter('category', e.target.value)}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
      </select>

      <button onClick={resetFilters}>Reset Filters</button>
    </div>
  );
}
```

**With Validation:**

```typescript
const validator = (filters: MyFilters) => {
  // Return false to reject invalid stored filters
  const validCategories = ['all', 'active', 'inactive'];
  return validCategories.includes(filters.category);
};

const { filters, updateFilter } = usePersistedFilters({
  storageKey: 'my-page-filters',
  defaultFilters,
  version: '1.0.0',
  validator,
});
```

**Version Management:**

When you change the filter structure, increment the version to invalidate old data:

```typescript
// Version 1.0.0
interface MyFilters {
  category: string;
  sortBy: string;
}

// Later, you add a new field - increment version to 1.1.0
interface MyFilters {
  category: string;
  sortBy: string;
  timeRange: string; // New field
}

const { filters } = usePersistedFilters({
  storageKey: 'my-page-filters',
  defaultFilters,
  version: '1.1.0', // Old data with version 1.0.0 will be discarded
});
```

**API Reference:**

```typescript
interface PersistedFiltersOptions<T> {
  storageKey: string;        // Unique key for localStorage
  defaultFilters: T;          // Default filter values
  version: string;            // Schema version (e.g., '1.0.0')
  validator?: (filters: T) => boolean; // Optional validation
  debug?: boolean;            // Enable debug logging
}

// Returns
{
  filters: T;                           // Current filter values
  updateFilter: <K>(key: K, value: T[K]) => void; // Update single field
  updateFilters: (updates: Partial<T>) => void;   // Update multiple fields
  resetFilters: () => void;             // Reset to defaults
  clearPersistedData: () => void;       // Clear from localStorage
  saveFilters: () => void;              // Manual save
  isLoaded: boolean;                    // Whether loaded from storage
}
```

**Cleanup Utility:**

```typescript
import { clearAllPersistedFilters } from '@/shared/hooks';

// Clear all filter-related keys
clearAllPersistedFilters();

// Clear only keys with specific prefix
clearAllPersistedFilters('achievements');
```

**Real-world Example:**

See `/apps/frontend/src/apps/student/pages/AchievementsPage.tsx` for a complete implementation.

---

### `useModuleAccess`

Check if a user has access to a specific module.

```typescript
const { hasAccess, isLoading, error } = useModuleAccess({
  moduleId: 'module-123',
  userId: user?.id,
});
```

---

### `useModuleDetail`

Fetch detailed information about a module.

```typescript
const { module, isLoading, error } = useModuleDetail('module-123');
```

---

### `useUserStatistics`

Get user statistics including XP, coins, and progress.

```typescript
const { stats, isLoading, error, refetch } = useUserStatistics(userId);
```

---

## Contributing

When adding a new shared hook:

1. Create the hook file in this directory
2. Add comprehensive JSDoc comments
3. Export from `index.ts`
4. Add unit tests in `__tests__/`
5. Update this README with usage examples
6. Consider if the hook should support SSR/SSG

## Best Practices

1. **Type Safety**: Always use TypeScript with proper generics
2. **Error Handling**: Include proper error states and fallbacks
3. **Performance**: Use `useMemo` and `useCallback` appropriately
4. **Cleanup**: Return cleanup functions from useEffect
5. **Reusability**: Make hooks configurable via options
6. **Testing**: Write comprehensive unit tests
7. **Documentation**: Include JSDoc comments and examples

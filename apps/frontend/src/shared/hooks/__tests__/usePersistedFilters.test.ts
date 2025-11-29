/**
 * Tests for usePersistedFilters Hook
 *
 * @created 2025-11-28
 * @issue P2-002
 */

import { renderHook, act } from '@testing-library/react';
import { usePersistedFilters, clearAllPersistedFilters } from '../usePersistedFilters';

interface TestFilters {
  category: string;
  status: 'all' | 'active' | 'inactive';
  sortBy: string;
}

const defaultFilters: TestFilters = {
  category: 'all',
  status: 'all',
  sortBy: 'date',
};

describe('usePersistedFilters', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with default filters when no stored data exists', () => {
      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
        }),
      );

      expect(result.current.filters).toEqual(defaultFilters);
      expect(result.current.isLoaded).toBe(true);
    });

    it('should load filters from localStorage if they exist and version matches', () => {
      const storedFilters: TestFilters = {
        category: 'active',
        status: 'active',
        sortBy: 'name',
      };

      localStorage.setItem(
        'test-filters',
        JSON.stringify({
          filters: storedFilters,
          version: '1.0.0',
          timestamp: Date.now(),
        }),
      );

      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
        }),
      );

      expect(result.current.filters).toEqual(storedFilters);
    });

    it('should use default filters if stored version does not match', () => {
      const storedFilters: TestFilters = {
        category: 'active',
        status: 'active',
        sortBy: 'name',
      };

      localStorage.setItem(
        'test-filters',
        JSON.stringify({
          filters: storedFilters,
          version: '0.9.0',
          timestamp: Date.now(),
        }),
      );

      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
        }),
      );

      expect(result.current.filters).toEqual(defaultFilters);
      expect(localStorage.getItem('test-filters')).toBeNull();
    });

    it('should merge stored filters with defaults if new keys are added', () => {
      const storedFilters = {
        category: 'active',
        status: 'active' as const,
      };

      localStorage.setItem(
        'test-filters',
        JSON.stringify({
          filters: storedFilters,
          version: '1.0.0',
          timestamp: Date.now(),
        }),
      );

      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
        }),
      );

      expect(result.current.filters).toEqual({
        category: 'active',
        status: 'active',
        sortBy: 'date', // Default value for missing key
      });
    });
  });

  describe('Validation', () => {
    it('should use validator to verify filter integrity', () => {
      const invalidFilters: TestFilters = {
        category: 'invalid',
        status: 'all',
        sortBy: 'date',
      };

      localStorage.setItem(
        'test-filters',
        JSON.stringify({
          filters: invalidFilters,
          version: '1.0.0',
          timestamp: Date.now(),
        }),
      );

      const validator = (filters: TestFilters) => {
        return filters.category !== 'invalid';
      };

      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
          validator,
        }),
      );

      expect(result.current.filters).toEqual(defaultFilters);
    });
  });

  describe('Filter Updates', () => {
    it('should update a single filter field', () => {
      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
        }),
      );

      act(() => {
        result.current.updateFilter('category', 'active');
      });

      expect(result.current.filters.category).toBe('active');
      expect(result.current.filters.status).toBe('all');
      expect(result.current.filters.sortBy).toBe('date');
    });

    it('should update multiple filter fields at once', () => {
      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
        }),
      );

      act(() => {
        result.current.updateFilters({
          category: 'active',
          sortBy: 'name',
        });
      });

      expect(result.current.filters).toEqual({
        category: 'active',
        status: 'all',
        sortBy: 'name',
      });
    });

    it('should persist filter updates to localStorage', () => {
      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
        }),
      );

      act(() => {
        result.current.updateFilter('category', 'active');
      });

      const stored = JSON.parse(localStorage.getItem('test-filters') || '{}');
      expect(stored.filters.category).toBe('active');
      expect(stored.version).toBe('1.0.0');
      expect(stored.timestamp).toBeDefined();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset filters to default values', () => {
      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
        }),
      );

      act(() => {
        result.current.updateFilters({
          category: 'active',
          status: 'active',
          sortBy: 'name',
        });
      });

      expect(result.current.filters).not.toEqual(defaultFilters);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual(defaultFilters);
    });

    it('should clear persisted data from localStorage', () => {
      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
        }),
      );

      act(() => {
        result.current.updateFilter('category', 'active');
      });

      expect(localStorage.getItem('test-filters')).not.toBeNull();

      act(() => {
        result.current.clearPersistedData();
      });

      expect(localStorage.getItem('test-filters')).toBeNull();
    });
  });

  describe('Manual Save', () => {
    it('should manually save current filters', () => {
      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
        }),
      );

      act(() => {
        result.current.saveFilters();
      });

      const stored = JSON.parse(localStorage.getItem('test-filters') || '{}');
      expect(stored.filters).toEqual(defaultFilters);
      expect(stored.version).toBe('1.0.0');
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('test-filters', 'invalid-json');

      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
        }),
      );

      expect(result.current.filters).toEqual(defaultFilters);
      expect(result.current.isLoaded).toBe(true);
    });

    it('should handle missing localStorage gracefully', () => {
      // Mock localStorage being unavailable
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true,
      });

      const { result } = renderHook(() =>
        usePersistedFilters({
          storageKey: 'test-filters',
          defaultFilters,
          version: '1.0.0',
        }),
      );

      expect(result.current.filters).toEqual(defaultFilters);

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });
  });
});

describe('clearAllPersistedFilters', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should clear all filter-related keys', () => {
    localStorage.setItem('achievements-filters', JSON.stringify({ test: 'data' }));
    localStorage.setItem('leaderboard-filters', JSON.stringify({ test: 'data' }));
    localStorage.setItem('other-data', JSON.stringify({ test: 'data' }));

    clearAllPersistedFilters();

    expect(localStorage.getItem('achievements-filters')).toBeNull();
    expect(localStorage.getItem('leaderboard-filters')).toBeNull();
    expect(localStorage.getItem('other-data')).not.toBeNull();
  });

  it('should clear only keys matching prefix', () => {
    localStorage.setItem('achievements-filters', JSON.stringify({ test: 'data' }));
    localStorage.setItem('leaderboard-filters', JSON.stringify({ test: 'data' }));
    localStorage.setItem('achievements-settings', JSON.stringify({ test: 'data' }));

    clearAllPersistedFilters('achievements');

    expect(localStorage.getItem('achievements-filters')).toBeNull();
    expect(localStorage.getItem('achievements-settings')).toBeNull();
    expect(localStorage.getItem('leaderboard-filters')).not.toBeNull();
  });
});

/**
 * useLtiConsumers Hook
 *
 * Comprehensive hook for managing LTI consumers in the admin portal.
 *
 * Features:
 * - List all LTI consumers with statistics
 * - CRUD operations for consumers
 * - Connection testing
 * - Credential management
 * - Error handling and loading states
 *
 * Created: 2026-01-27 - EXT-007 LTI Integration
 * @see lti-consumers.controller.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { ltiApi } from '@/services/api/admin/ltiAPI';
import type {
  LtiConsumer,
  CreateLtiConsumerDto,
  UpdateLtiConsumerDto,
  LtiConsumerStats,
  ConnectionTestResult,
  LtiCredentials,
} from '@/shared/types/lti.types';

export interface UseLtiConsumersResult {
  // Data
  consumers: LtiConsumer[];
  stats: LtiConsumerStats | null;
  selectedConsumer: LtiConsumer | null;

  // State
  loading: boolean;
  error: string | null;
  testingConnection: boolean;
  regeneratingCredentials: boolean;

  // Operations
  fetchConsumers: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createConsumer: (data: CreateLtiConsumerDto) => Promise<LtiConsumer>;
  updateConsumer: (id: string, data: UpdateLtiConsumerDto) => Promise<LtiConsumer>;
  verifyConsumer: (id: string) => Promise<LtiConsumer>;
  activateConsumer: (id: string) => Promise<LtiConsumer>;
  deactivateConsumer: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<ConnectionTestResult>;
  regenerateCredentials: (id: string) => Promise<LtiCredentials>;
  selectConsumer: (consumer: LtiConsumer | null) => void;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing LTI consumers in the admin portal
 *
 * @returns {UseLtiConsumersResult} Consumer data, loading state, and operations
 *
 * @example
 * ```tsx
 * const { consumers, loading, error, createConsumer, testConnection } = useLtiConsumers();
 *
 * const handleCreate = async (data: CreateLtiConsumerDto) => {
 *   try {
 *     await createConsumer(data);
 *     toast.success('Consumer created');
 *   } catch (err) {
 *     toast.error('Failed to create consumer');
 *   }
 * };
 * ```
 */
export function useLtiConsumers(): UseLtiConsumersResult {
  // State management
  const [consumers, setConsumers] = useState<LtiConsumer[]>([]);
  const [stats, setStats] = useState<LtiConsumerStats | null>(null);
  const [selectedConsumer, setSelectedConsumer] = useState<LtiConsumer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [regeneratingCredentials, setRegeneratingCredentials] = useState(false);

  // ============================================================================
  // API CALLS - READ OPERATIONS
  // ============================================================================

  /**
   * Fetch all LTI consumers
   */
  const fetchConsumers = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await ltiApi.getConsumers();
      setConsumers(data || []);
    } catch (err) {
      console.error('[useLtiConsumers] Failed to fetch consumers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch consumers');
      setConsumers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch consumer statistics
   */
  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      const data = await ltiApi.getConsumerStats();
      setStats(data);
    } catch (err) {
      console.error('[useLtiConsumers] Failed to fetch stats:', err);
      // Don't set error for stats - not critical
    }
  }, []);

  /**
   * Refetch all data
   */
  const refetch = useCallback(async (): Promise<void> => {
    await Promise.all([fetchConsumers(), fetchStats()]);
  }, [fetchConsumers, fetchStats]);

  // ============================================================================
  // API CALLS - WRITE OPERATIONS
  // ============================================================================

  /**
   * Create a new LTI consumer
   */
  const createConsumer = useCallback(
    async (data: CreateLtiConsumerDto): Promise<LtiConsumer> => {
      setLoading(true);
      setError(null);
      try {
        const consumer = await ltiApi.createConsumer(data);
        await refetch();
        return consumer;
      } catch (err) {
        console.error('[useLtiConsumers] Failed to create consumer:', err);
        const message = err instanceof Error ? err.message : 'Failed to create consumer';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refetch]
  );

  /**
   * Update an existing LTI consumer
   */
  const updateConsumer = useCallback(
    async (id: string, data: UpdateLtiConsumerDto): Promise<LtiConsumer> => {
      setLoading(true);
      setError(null);
      try {
        const consumer = await ltiApi.updateConsumer(id, data);
        await refetch();
        return consumer;
      } catch (err) {
        console.error('[useLtiConsumers] Failed to update consumer:', err);
        const message = err instanceof Error ? err.message : 'Failed to update consumer';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refetch]
  );

  /**
   * Verify an LTI consumer
   */
  const verifyConsumer = useCallback(
    async (id: string): Promise<LtiConsumer> => {
      setLoading(true);
      setError(null);
      try {
        const consumer = await ltiApi.verifyConsumer(id);
        await refetch();
        return consumer;
      } catch (err) {
        console.error('[useLtiConsumers] Failed to verify consumer:', err);
        const message = err instanceof Error ? err.message : 'Failed to verify consumer';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refetch]
  );

  /**
   * Activate a deactivated LTI consumer
   */
  const activateConsumer = useCallback(
    async (id: string): Promise<LtiConsumer> => {
      setLoading(true);
      setError(null);
      try {
        const consumer = await ltiApi.activateConsumer(id);
        await refetch();
        return consumer;
      } catch (err) {
        console.error('[useLtiConsumers] Failed to activate consumer:', err);
        const message = err instanceof Error ? err.message : 'Failed to activate consumer';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refetch]
  );

  /**
   * Deactivate (soft delete) an LTI consumer
   */
  const deactivateConsumer = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await ltiApi.deactivateConsumer(id);
        await refetch();
      } catch (err) {
        console.error('[useLtiConsumers] Failed to deactivate consumer:', err);
        const message = err instanceof Error ? err.message : 'Failed to deactivate consumer';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refetch]
  );

  /**
   * Test connection to an LTI consumer
   */
  const testConnection = useCallback(async (id: string): Promise<ConnectionTestResult> => {
    setTestingConnection(true);
    try {
      const result = await ltiApi.testConnection(id);
      return result;
    } catch (err) {
      console.error('[useLtiConsumers] Connection test failed:', err);
      throw err;
    } finally {
      setTestingConnection(false);
    }
  }, []);

  /**
   * Regenerate credentials for an LTI consumer
   */
  const regenerateCredentials = useCallback(async (id: string): Promise<LtiCredentials> => {
    setRegeneratingCredentials(true);
    try {
      const credentials = await ltiApi.regenerateCredentials(id);
      return credentials;
    } catch (err) {
      console.error('[useLtiConsumers] Failed to regenerate credentials:', err);
      throw err;
    } finally {
      setRegeneratingCredentials(false);
    }
  }, []);

  /**
   * Select a consumer for viewing/editing
   */
  const selectConsumer = useCallback((consumer: LtiConsumer | null): void => {
    setSelectedConsumer(consumer);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Initial data fetch on mount
   */
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    consumers,
    stats,
    selectedConsumer,

    // State
    loading,
    error,
    testingConnection,
    regeneratingCredentials,

    // Operations
    fetchConsumers,
    fetchStats,
    createConsumer,
    updateConsumer,
    verifyConsumer,
    activateConsumer,
    deactivateConsumer,
    testConnection,
    regenerateCredentials,
    selectConsumer,
    refetch,
  };
}

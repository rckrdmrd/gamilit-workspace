import { useState, useEffect, useCallback } from 'react';
import { api } from '@shared/utils';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFetch<T>(url: string, options?: RequestInit): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useCallback(() => new AbortController(), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const controller = abortControllerRef();

    try {
      const response = await api.get<T>(url, {
        ...options,
        signal: controller.signal,
      });
      setData(response.data);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, options, abortControllerRef]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

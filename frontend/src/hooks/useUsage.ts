import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { UsageQuota } from '@/types/api';

export function useUsage() {
  const [usage, setUsage] = useState<UsageQuota | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getUsage();
      setUsage(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load usage");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return { usage, loading, error, refreshUsage: fetchUsage };
}

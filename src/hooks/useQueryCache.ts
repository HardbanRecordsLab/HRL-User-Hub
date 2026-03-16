import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Hook do zarządzania cache'em zapytań
 * Implementuje optymistyczne aktualizacje i prefetching
 */
export const useQueryCache = () => {
  const queryClient = useQueryClient();

  /**
   * Invaliduje cache dla określonego klucza
   */
  const invalidate = useCallback((queryKey: string | string[]) => {
    queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
  }, [queryClient]);

  /**
   * Prefetch danych przed nawigacją
   */
  const prefetch = useCallback(async <T>(
    queryKey: string[],
    queryFn: () => Promise<T>,
    staleTime = 5 * 60 * 1000 // 5 minut
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime,
    });
  }, [queryClient]);

  /**
   * Optymistyczna aktualizacja cache
   */
  const optimisticUpdate = useCallback(<T>(
    queryKey: string[],
    updater: (old: T | undefined) => T
  ) => {
    queryClient.setQueryData(queryKey, updater);
  }, [queryClient]);

  /**
   * Pobiera dane z cache bez wykonywania zapytania
   */
  const getFromCache = useCallback(<T>(queryKey: string[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  }, [queryClient]);

  /**
   * Czyści cały cache
   */
  const clearAll = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  return {
    invalidate,
    prefetch,
    optimisticUpdate,
    getFromCache,
    clearAll,
  };
};

/**
 * Konfiguracja domyślna dla React Query
 * Używana w QueryClientProvider
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minut - dane są świeże
      gcTime: 30 * 60 * 1000, // 30 minut - czas w cache
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
};

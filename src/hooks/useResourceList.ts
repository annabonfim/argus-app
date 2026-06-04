import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getErrorMessage } from '@/api/errors';

interface ResourceListState<T> {
  data: T[];
  loading: boolean; // carga inicial
  refreshing: boolean; // pull-to-refresh
  error: string | null;
  refresh: () => void;
}

// Carrega uma lista da API e recarrega sempre que a tela ganha foco (cobre o
// retorno do formulário após criar/editar/excluir). Trata loading e erro.
export function useResourceList<T>(
  fetcher: () => Promise<T[]>,
): ResourceListState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh: boolean) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        setData(await fetcher());
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [fetcher],
  );

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load]),
  );

  return { data, loading, refreshing, error, refresh: () => load(true) };
}

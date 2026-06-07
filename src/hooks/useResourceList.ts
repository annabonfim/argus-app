import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getErrorMessage } from '@/api/errors';

interface ResourceListState<T> {
  data: T[];
  loading: boolean; // carga inicial
  refreshing: boolean; // pull-to-refresh
  error: string | null;
  refresh: () => void;
  reloadSilent: () => void; // recarga em segundo plano (polling), sem spinner
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

  // 'initial' mostra o spinner de tela; 'refresh' o de pull-to-refresh;
  // 'silent' atualiza em segundo plano (polling) sem spinner e sem derrubar a
  // tela numa falha passageira de rede.
  const load = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent') => {
      if (mode === 'refresh') setRefreshing(true);
      else if (mode === 'initial') setLoading(true);
      if (mode !== 'silent') setError(null);
      try {
        setData(await fetcher());
      } catch (err) {
        if (mode !== 'silent') setError(getErrorMessage(err));
      } finally {
        if (mode === 'refresh') setRefreshing(false);
        else if (mode === 'initial') setLoading(false);
      }
    },
    [fetcher],
  );

  useFocusEffect(
    useCallback(() => {
      load('initial');
    }, [load]),
  );

  return {
    data,
    loading,
    refreshing,
    error,
    refresh: () => load('refresh'),
    reloadSilent: () => load('silent'),
  };
}

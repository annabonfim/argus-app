import { api } from './client';
import type { Recurso } from '@/types/domain';

const PATH = '/api/recursos';

export async function listRecursos(): Promise<Recurso[]> {
  const { data } = await api.get<Recurso[]>(PATH);
  return data;
}

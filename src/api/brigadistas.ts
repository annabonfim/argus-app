import { api } from './client';
import type { Brigadista, BrigadistaInput } from '@/types/domain';

const PATH = '/api/brigadistas';

export async function listBrigadistas(): Promise<Brigadista[]> {
  const { data } = await api.get<Brigadista[]>(PATH);
  return data;
}

export async function getBrigadista(id: number): Promise<Brigadista> {
  const { data } = await api.get<Brigadista>(`${PATH}/${id}`);
  return data;
}

// Escrita restrita a Admin/Coordenador (403 pra Brigadista).
export async function createBrigadista(
  input: BrigadistaInput,
): Promise<Brigadista> {
  const { data } = await api.post<Brigadista>(PATH, input);
  return data;
}

export async function updateBrigadista(
  id: number,
  input: BrigadistaInput,
): Promise<void> {
  await api.put(`${PATH}/${id}`, { ...input, id });
}

export async function deleteBrigadista(id: number): Promise<void> {
  await api.delete(`${PATH}/${id}`);
}

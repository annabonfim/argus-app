import { api } from './client';
import type { Brigada, BrigadaInput } from '@/types/domain';

const PATH = '/api/brigadas';

export async function listBrigadas(): Promise<Brigada[]> {
  const { data } = await api.get<Brigada[]>(PATH);
  return data;
}

export async function getBrigada(id: number): Promise<Brigada> {
  const { data } = await api.get<Brigada>(`${PATH}/${id}`);
  return data;
}

// Escrita restrita a Admin/Coordenador (403 pra Brigadista).
export async function createBrigada(input: BrigadaInput): Promise<Brigada> {
  const { data } = await api.post<Brigada>(PATH, input);
  return data;
}

export async function updateBrigada(
  id: number,
  input: BrigadaInput,
): Promise<void> {
  await api.put(`${PATH}/${id}`, { ...input, id });
}

export async function deleteBrigada(id: number): Promise<void> {
  await api.delete(`${PATH}/${id}`);
}

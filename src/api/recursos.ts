import { api } from './client';
import type { Recurso, RecursoInput } from '@/types/domain';

const PATH = '/api/recursos';

export async function listRecursos(): Promise<Recurso[]> {
  const { data } = await api.get<Recurso[]>(PATH);
  return data;
}

export async function getRecurso(id: number): Promise<Recurso> {
  const { data } = await api.get<Recurso>(`${PATH}/${id}`);
  return data;
}

// Escrita restrita a Admin/Coordenador (403 pros demais).
export async function createRecurso(input: RecursoInput): Promise<Recurso> {
  const { data } = await api.post<Recurso>(PATH, input);
  return data;
}

export async function updateRecurso(
  id: number,
  input: RecursoInput,
): Promise<void> {
  await api.put(`${PATH}/${id}`, { ...input, id });
}

export async function deleteRecurso(id: number): Promise<void> {
  await api.delete(`${PATH}/${id}`);
}

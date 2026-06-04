import { api } from './client';
import type { Ocorrencia, OcorrenciaInput } from '@/types/domain';

const PATH = '/api/ocorrencias';

export async function listOcorrencias(): Promise<Ocorrencia[]> {
  const { data } = await api.get<Ocorrencia[]>(PATH);
  return data;
}

export async function getOcorrencia(id: number): Promise<Ocorrencia> {
  const { data } = await api.get<Ocorrencia>(`${PATH}/${id}`);
  return data;
}

// POST/DELETE são restritos a Admin/Coordenador no backend (403 pra Brigadista).
export async function createOcorrencia(
  input: OcorrenciaInput,
): Promise<Ocorrencia> {
  const { data } = await api.post<Ocorrencia>(PATH, input);
  return data;
}

// PUT (atualizar, inclusive status) é liberado pra qualquer perfil logado.
export async function updateOcorrencia(
  id: number,
  input: OcorrenciaInput,
): Promise<void> {
  await api.put(`${PATH}/${id}`, { ...input, id });
}

export async function deleteOcorrencia(id: number): Promise<void> {
  await api.delete(`${PATH}/${id}`);
}

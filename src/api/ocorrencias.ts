import { api } from './client';
import type {
  Ocorrencia,
  OcorrenciaInput,
  StatusOcorrencia,
} from '@/types/domain';

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

// PUT = edição completa da ocorrência (descrição, brigada, etc.). Restrito a
// Admin/Coordenador no backend — Brigadista recebe 403.
export async function updateOcorrencia(
  id: number,
  input: OcorrenciaInput,
): Promise<void> {
  await api.put(`${PATH}/${id}`, { ...input, id });
}

// PATCH dedicado só pra avançar o status. Liberado pro Brigadista na PRÓPRIA
// brigada (403 fora dela / sem vínculo). Manda apenas { status } — nunca o
// objeto inteiro. O backend cuida de dataFinalizacao quando finaliza.
export async function updateStatusOcorrencia(
  id: number,
  status: StatusOcorrencia,
): Promise<void> {
  await api.patch(`${PATH}/${id}/status`, { status });
}

export async function deleteOcorrencia(id: number): Promise<void> {
  await api.delete(`${PATH}/${id}`);
}

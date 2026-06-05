import { api } from './client';
import type { Alerta, Ocorrencia } from '@/types/domain';

// Alertas operacionais (Java/NASA FIRMS), expostos pelo .NET via proxy.
const PATH = '/api/alertas';

export async function listAlertas(): Promise<Alerta[]> {
  const { data } = await api.get<Alerta[]>(PATH);
  return data;
}

export async function getAlerta(id: number): Promise<Alerta> {
  const { data } = await api.get<Alerta>(`${PATH}/${id}`);
  return data;
}

// Promove um alerta a ocorrência operacional. Restrito a Admin/Coordenador
// (403 pra Brigadista). Se descricao for null/vazia, o backend gera uma a
// partir do alerta. Responde 201 com a Ocorrencia já com alertaId preenchido.
export async function criarOcorrenciaDeAlerta(
  alertaId: number,
  input: {
    brigadaId: number;
    brigadistaId: number;
    latitude: number;
    longitude: number;
    descricao?: string | null;
  },
): Promise<Ocorrencia> {
  const { data } = await api.post<Ocorrencia>(
    `${PATH}/${alertaId}/criar-ocorrencia`,
    input,
  );
  return data;
}

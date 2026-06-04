import { api } from './client';
import type { RegistroCampo, RegistroCampoInput } from '@/types/domain';

const PATH = '/api/registroscampo';

export async function listRegistros(): Promise<RegistroCampo[]> {
  const { data } = await api.get<RegistroCampo[]>(PATH);
  return data;
}

export async function getRegistro(id: number): Promise<RegistroCampo> {
  const { data } = await api.get<RegistroCampo>(`${PATH}/${id}`);
  return data;
}

export async function createRegistro(
  input: RegistroCampoInput,
): Promise<RegistroCampo> {
  const { data } = await api.post<RegistroCampo>(PATH, input);
  return data;
}

// O .NET exige o Id no body batendo com o da rota; PUT responde 204 (sem corpo).
export async function updateRegistro(
  id: number,
  input: RegistroCampoInput,
): Promise<void> {
  await api.put(`${PATH}/${id}`, { ...input, id });
}

export async function deleteRegistro(id: number): Promise<void> {
  await api.delete(`${PATH}/${id}`);
}

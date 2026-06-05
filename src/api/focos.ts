import { api } from './client';
import type { FocoCalor } from '@/types/domain';

// Focos de calor brutos do satélite (NASA FIRMS). O .NET faz proxy pro Java.
export async function listarFocos(): Promise<FocoCalor[]> {
  const { data } = await api.get<FocoCalor[]>('/api/focos');
  return data;
}

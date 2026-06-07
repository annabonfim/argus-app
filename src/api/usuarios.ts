import { api } from './client';
import type { UsuarioDetalhe } from '@/types/domain';

// Listagem administrativa de usuários. Restrito a Admin no backend
// (qualquer outro perfil recebe 403).
const PATH = '/api/usuarios';

export async function listUsuarios(): Promise<UsuarioDetalhe[]> {
  const { data } = await api.get<UsuarioDetalhe[]>(PATH);
  return data;
}

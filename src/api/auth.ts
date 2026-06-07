import { api } from './client';
import type {AuthResponse,LoginRequest,MeResponse,PerfilUpdateInput,RegisterRequest} from '@/types/domain';

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/login', body);
  return data;
}

// Sempre cria como Brigadista no backend; retorna 201 com o mesmo corpo do
// login (token + usuario), então já autentica sem precisar de um segundo login.
export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/register', body);
  return data;
}

export async function me(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/api/auth/me');
  return data;
}

// Atualiza o próprio perfil (campos editáveis pelo usuário). Responde 204.
export async function atualizarPerfil(input: PerfilUpdateInput): Promise<void> {
  await api.put('/api/auth/me', input);
}

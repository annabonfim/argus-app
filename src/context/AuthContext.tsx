import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '@/api/client';
import * as authApi from '@/api/auth';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Usuario,
} from '@/types/domain';

const TOKEN_KEY = 'argus.token';
const USER_KEY = 'argus.user';
const EXPIRA_KEY = 'argus.expiraEm';

interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean; // true enquanto hidrata a sessão salva no boot
  signIn: (credentials: LoginRequest) => Promise<void>;
  signUp: (data: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (usuario: Usuario) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Aplica/remove o header Authorization no axios conforme o token muda.
function setAuthHeader(token: string | null): void {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Atualiza o usuário em memória e no SecureStore (após editar o perfil).
  const updateUser = useCallback(async (usuario: Usuario) => {
    setUser(usuario);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(usuario));
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setToken(null);
    setAuthHeader(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    await SecureStore.deleteItemAsync(EXPIRA_KEY);
  }, []);

  // Hidrata a sessão salva quando o app abre. Se o token já passou da data de
  // expiração, descarta a sessão e cai no login (sem mostrar o app por engano).
  useEffect(() => {
    (async () => {
      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const savedUser = await SecureStore.getItemAsync(USER_KEY);
      const savedExpira = await SecureStore.getItemAsync(EXPIRA_KEY);
      const expirou = savedExpira ? new Date(savedExpira) <= new Date() : false;

      if (savedToken && savedUser && !expirou) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser) as Usuario);
        setAuthHeader(savedToken);
      } else if (expirou) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        await SecureStore.deleteItemAsync(EXPIRA_KEY);
      }
      setIsLoading(false);
    })();
  }, []);

  // 401 num endpoint autenticado = token expirado/inválido → derruba a sessão.
  // 401 em login/register = credencial recusada, não sessão expirada: deixa o
  // erro subir pra tela tratar, sem deslogar.
  useEffect(() => {
    const id = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const url: string = error.config?.url ?? '';
        const isLoginOrRegister =
          url.includes('/auth/login') || url.includes('/auth/register');
        if (error.response?.status === 401 && !isLoginOrRegister) {
          signOut();
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(id);
  }, [signOut]);

  // Aplica e persiste a sessão recebida do login ou do register (token, usuário
  // e a data de expiração, usada pra validar a sessão no próximo boot).
  const persistSession = useCallback(
    async ({ token: newToken, usuario, expiraEm }: AuthResponse) => {
      setAuthHeader(newToken);
      setToken(newToken);
      setUser(usuario);
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(usuario));
      await SecureStore.setItemAsync(EXPIRA_KEY, expiraEm);
    },
    [],
  );

  const signIn = useCallback(
    async (credentials: LoginRequest) => {
      await persistSession(await authApi.login(credentials));
    },
    [persistSession],
  );

  // Register já devolve token + usuario (cria sempre como Brigadista), então
  // entra direto no app sem um segundo login.
  const signUp = useCallback(
    async (data: RegisterRequest) => {
      await persistSession(await authApi.register(data));
    },
    [persistSession],
  );

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signIn, signUp, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de um AuthProvider');
  }
  return context;
}

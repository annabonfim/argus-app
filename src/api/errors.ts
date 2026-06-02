import axios from 'axios';
import type { ProblemDetails } from '@/types/domain';

// Traduz qualquer erro de chamada em uma frase curta em português pra UI.
// Prioriza o `detail`/`title` do ProblemDetails do .NET; cai em mensagens por
// status; e por fim em rede/timeout.
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'A conexão demorou demais. Tente novamente.';
    }
    if (!error.response) {
      return 'Sem conexão com o servidor. Verifique a rede.';
    }

    // Alguns endpoints (ex.: login) respondem com a mensagem em string crua;
    // outros com ProblemDetails. Cobrimos os dois.
    const data = error.response.data;
    if (typeof data === 'string' && data.trim()) return data.trim();

    const problem = data as ProblemDetails | undefined;
    if (problem?.detail) return problem.detail;
    if (problem?.title) return problem.title;

    switch (error.response.status) {
      case 401:
        return 'Sessão expirada. Entre novamente.';
      case 403:
        return 'Você não tem permissão para esta ação.';
      case 404:
        return 'Registro não encontrado.';
      case 409:
        return 'Conflito: registro duplicado ou com dependências.';
      case 503:
        return 'Serviço temporariamente indisponível.';
      default:
        return 'Algo deu errado. Tente novamente.';
    }
  }
  return 'Erro inesperado. Tente novamente.';
}

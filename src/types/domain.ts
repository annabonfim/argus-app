// Tipos espelhando os DTOs da API .NET (Argus.Operations.API).
// Mantidos em sincronia manual com o backend — qualquer mudança de contrato
// lá precisa refletir aqui.

// PerfilUsuario do .NET é enum numérico; a API serializa como número.
export enum PerfilUsuario {
  Admin = 1,
  Coordenador = 2,
  Brigadista = 3,
}

export interface Usuario {
  id: number; // long no .NET, serializado como número no JSON
  nome: string;
  email: string;
  telefone: string;
  // Contato de emergência — opcional no backend (null pra usuários admin).
  nomeEmergencia: string | null;
  telefoneEmergencia: string | null;
  relacaoEmergencia: string | null;
  perfil: PerfilUsuario;
  // Vínculo com o Brigadista (e, por ele, a brigada). null pra Admin/Coordenador.
  brigadistaId: number | null;
}

// Usuário completo da listagem administrativa (GET /api/usuarios, só Admin).
// Shape mais rico que o Usuario logado: inclui status e datas.
export interface UsuarioDetalhe {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  nomeEmergencia: string | null;
  telefoneEmergencia: string | null;
  relacaoEmergencia: string | null;
  perfil: PerfilUsuario;
  ativo: boolean;
  dataCriacao: string; // ISO 8601
  ultimoLogin: string | null;
}

// Resposta de POST /api/auth/login
export interface AuthResponse {
  token: string;
  expiraEm: string; // ISO 8601 vindo do .NET
  usuario: Usuario;
}

// Resposta de GET /api/auth/me
export interface MeResponse {
  isAuthenticated: boolean;
  name: string;
  role: string;
  claims: Record<string, string>;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

// PUT /api/auth/me — o usuário logado edita o próprio perfil (campos seguros).
export interface PerfilUpdateInput {
  nome: string;
  telefone: string;
  nomeEmergencia?: string;
  telefoneEmergencia?: string;
  relacaoEmergencia?: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  telefone: string;
  // Contato de emergência — opcional; omitido do payload quando não preenchido.
  nomeEmergencia?: string;
  telefoneEmergencia?: string;
  relacaoEmergencia?: string;
  senha: string;
  codigoConvite: string;
}

// ProblemDetails (RFC 7807) — formato padronizado de erro do .NET.
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

// Alerta operacional gerado pelo módulo Java a partir de um foco de calor
// (NASA FIRMS), filtrado/priorizado. Exposto pelo .NET via proxy.
// As coordenadas NÃO vivem aqui — estão no FocoCalor (focoCalorId).
export type NivelAlerta = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
export type StatusAlerta =
  | 'ABERTO'
  | 'EM_ANALISE'
  | 'ENCAMINHADO'
  | 'ENCERRADO';

export interface Alerta {
  id: number;
  titulo: string;
  descricao: string | null;
  nivel: NivelAlerta;
  status: StatusAlerta;
  scoreRisco: number | null; // 0-100
  recomendacaoOperacional: string | null;
  dataGeracao: string; // ISO 8601
  dataAtualizacao: string | null;
  focoCalorId: number; // FK pro foco que gerou o alerta
}

// Foco de calor bruto do satélite (NASA FIRMS), exposto pelo .NET em /api/focos.
// Mais rico que o Alerta — traz os dados do sensor pra visualização no mapa.
export interface FocoCalor {
  id: number;
  latitude: number;
  longitude: number;
  frp: number | null; // Fire Radiative Power (MW) — intensidade
  temperaturaEstimada: number | null; // Kelvin
  confianca: string | null; // "ALTA" | "MEDIA" | "BAIXA"
  satelite: string | null; // ex.: "Aqua", "Terra"
  sensor: string | null; // ex.: "MODIS", "VIIRS"
  origemDado: string | null; // ex.: "NASA_FIRMS"
  dataHora: string; // ISO 8601 — quando o satélite detectou
  status: string | null;
  payloadJson: string | null; // dados brutos do FIRMS (ignorado na UI)
  regiaoId: number | null;
}

// ─── Recursos CRUD (entidades cruas expostas pela API) ───────────────────────

export enum StatusOcorrencia {
  Aberta = 1,
  EmAtendimento = 2,
  Controlada = 3,
  Finalizada = 4,
}

export enum TipoRecurso {
  Veiculo = 1,
  Ferramenta = 2,
  EPI = 3,
  Comunicacao = 4,
}

export interface Brigada {
  id: number;
  nome: string;
  baseOperacional: string;
  telefone: string;
  ativa: boolean;
}

export interface Recurso {
  id: number;
  nome: string;
  tipo: TipoRecurso;
  disponivel: boolean;
  brigadaId: number;
}

export interface RecursoInput {
  nome: string;
  tipo: TipoRecurso;
  disponivel: boolean;
  brigadaId: number;
}

export interface Brigadista {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  telefone: string;
  funcao: string;
  ativo: boolean;
  dataAdmissao: string; // ISO 8601
  brigadaId: number;
}

export interface Ocorrencia {
  id: number;
  descricao: string;
  latitude: number;
  longitude: number;
  status: StatusOcorrencia;
  dataAbertura: string; // ISO 8601
  dataFinalizacao: string | null;
  brigadistaId: number;
  brigadaId: number;
  alertaId: number | null; // FK cross-domain pro alerta de satélite (Java)
}

export interface RegistroCampo {
  id: number;
  observacao: string;
  urlFoto: string;
  latitude: number;
  longitude: number;
  dataRegistro: string; // ISO 8601
  ocorrenciaId: number;
}

// Inputs (payloads de POST/PUT). O id, quando necessário no PUT, é adicionado
// pela função de API — aqui ficam só os campos que o formulário preenche.
export interface RegistroCampoInput {
  observacao: string;
  urlFoto: string;
  latitude: number;
  longitude: number;
  dataRegistro: string;
  ocorrenciaId: number;
}

export interface OcorrenciaInput {
  descricao: string;
  latitude: number;
  longitude: number;
  status: StatusOcorrencia;
  dataAbertura: string;
  dataFinalizacao?: string | null;
  brigadistaId: number;
  brigadaId: number;
  alertaId?: number | null;
}

export interface BrigadaInput {
  nome: string;
  baseOperacional: string;
  telefone: string;
  ativa: boolean;
}

export interface BrigadistaInput {
  nome: string;
  matricula: string;
  email: string;
  telefone: string;
  funcao: string;
  ativo: boolean;
  dataAdmissao: string;
  brigadaId: number;
}

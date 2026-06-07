import {PerfilUsuario,StatusOcorrencia,TipoRecurso,type NivelAlerta,type StatusAlerta} from '@/types/domain';
import { colors } from '@/theme';

// Tema por nível de alerta: rótulo + cor (da paleta existente). Da urgência
// (crítico/vermelho) ao baixo (verde).
export const NIVEL_ALERTA_THEME: Record<
  NivelAlerta,
  { label: string; color: string }
> = {
  CRITICO: { label: 'Crítico', color: colors.danger },
  ALTO: { label: 'Alto', color: colors.fire },
  MEDIO: { label: 'Médio', color: colors.fireWarm },
  BAIXO: { label: 'Baixo', color: colors.success },
};

export const STATUS_ALERTA_LABEL: Record<StatusAlerta, string> = {
  ABERTO: 'Aberto',
  EM_ANALISE: 'Em análise',
  ENCAMINHADO: 'Encaminhado',
  ENCERRADO: 'Encerrado',
};

// Tema por status: label + cores. Cores semânticas (urgência → estável →
// concluída) pra que uma lista com status diferentes seja lida num relance.
export const statusOcorrenciaTheme: Record<
  StatusOcorrencia,
  { label: string; bg: string; fg: string }
> = {
  [StatusOcorrencia.Aberta]: { label: 'Aberta', bg: colors.fire, fg: colors.cream },
  [StatusOcorrencia.EmAtendimento]: {
    label: 'Em atendimento',
    bg: colors.fireWarm,
    fg: colors.cream,
  },
  [StatusOcorrencia.Controlada]: {
    label: 'Controlada',
    bg: colors.olive,
    fg: colors.cream,
  },
  [StatusOcorrencia.Finalizada]: {
    label: 'Finalizada',
    bg: colors.success,
    fg: colors.cream,
  },
};

export const STATUS_OCORRENCIA_LABEL: Record<StatusOcorrencia, string> = {
  [StatusOcorrencia.Aberta]: statusOcorrenciaTheme[StatusOcorrencia.Aberta].label,
  [StatusOcorrencia.EmAtendimento]:
    statusOcorrenciaTheme[StatusOcorrencia.EmAtendimento].label,
  [StatusOcorrencia.Controlada]:
    statusOcorrenciaTheme[StatusOcorrencia.Controlada].label,
  [StatusOcorrencia.Finalizada]:
    statusOcorrenciaTheme[StatusOcorrencia.Finalizada].label,
};

export const PERFIL_LABEL: Record<PerfilUsuario, string> = {
  [PerfilUsuario.Admin]: 'Administrador',
  [PerfilUsuario.Coordenador]: 'Coordenador',
  [PerfilUsuario.Brigadista]: 'Brigadista',
};

// Opções do dropdown de relação/parentesco do contato de emergência.
export const RELACOES_EMERGENCIA: string[] = [
  'Mãe',
  'Pai',
  'Cônjuge',
  'Filho(a)',
  'Irmão(ã)',
  'Avô(ó)',
  'Tio(a)',
  'Namorado(a)',
  'Amigo(a)',
  'Outro parente',
  'Outro',
];

export const TIPO_RECURSO_LABEL: Record<TipoRecurso, string> = {
  [TipoRecurso.Veiculo]: 'Veículo',
  [TipoRecurso.Ferramenta]: 'Ferramenta',
  [TipoRecurso.EPI]: 'EPI',
  [TipoRecurso.Comunicacao]: 'Comunicação',
};

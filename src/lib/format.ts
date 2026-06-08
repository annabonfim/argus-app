import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIMEZONE = 'America/Sao_Paulo';

// O backend manda timestamps em UTC. Se vierem sem designador de fuso ('Z' ou
// offset), tratamos como UTC pra o instante ficar correto.
function toUtcDate(iso: string): Date {
  const s = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  return new Date(s);
}

// Data/hora em pt-BR no fuso de Brasília: "08/06/2026 às 15:57". O timeZone é
// fixo pra não depender do fuso do aparelho (o emulador às vezes está em UTC).
export function formatDateTime(iso: string): string {
  const date = toUtcDate(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const dia = date.toLocaleDateString('pt-BR', { timeZone: TIMEZONE });
  const hora = date.toLocaleTimeString('pt-BR', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dia} às ${hora}`;
}

// Data relativa: "há cerca de 20 minutos" (instante correto via toUtcDate).
export function formatRelative(iso: string): string {
  const date = toUtcDate(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

export function formatCoords(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

// Máscara progressiva pra INPUT de telefone — formata enquanto digita:
// "(11) 99911-8787". Vai montando conforme os dígitos entram.
export function maskTelefone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Formata telefone brasileiro: 11 dígitos → (11) 99911-8787, 10 → (11) 3231-1234.
// Se não tiver 10/11 dígitos, devolve como veio.
export function formatTelefone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return raw;
}

import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Data/hora explícita em pt-BR: "02/06/2026 às 15:57". Num app de operações,
// a hora exata importa (timeline de resposta ao foco).
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

// Data relativa: "há cerca de 20 minutos". Usada no mapa de focos, onde o que
// importa é o quão recente é a detecção do satélite.
export function formatRelative(iso: string): string {
  const date = new Date(iso);
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

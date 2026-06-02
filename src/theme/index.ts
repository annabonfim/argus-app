export { colors } from './colors';
export type { ColorToken } from './colors';

// Spacing baseado em múltiplos de 4 — escala consistente pra padding, margin, gap.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Raio de borda — usado em botões, inputs e cards.
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

// Famílias carregadas via expo-font no _layout raiz. Cada peso é um arquivo
// próprio (por isso usamos fontFamily, não fontWeight). Oswald (condensada) dá
// a identidade nos títulos; Inter (neutra) garante legibilidade no corpo.
export const fonts = {
  heading: 'Oswald_600SemiBold',
  headingBold: 'Oswald_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

// Tipografia — tamanhos + família para títulos, corpo e legenda.
export const typography = {
  title: { fontSize: 24, fontFamily: fonts.headingBold },
  subtitle: { fontSize: 18, fontFamily: fonts.heading },
  body: { fontSize: 15, fontFamily: fonts.body },
  caption: { fontSize: 13, fontFamily: fonts.body },
  button: { fontSize: 16, fontFamily: fonts.heading },
} as const;

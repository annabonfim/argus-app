// Paleta extraída do logo do Argus (Argus Panoptes, o vigia de cem olhos).
// Hex extraídos diretamente da imagem do logo — ajustar com cuidado se trocar a marca.
export const colors = {
  // Core (do logo)
  forest: '#142821',       // verde-floresta escuro — headers, texto principal, botões primários
  fire: '#C75B2C',         // terracota (laranja queimado) — accent de UI: CTAs, links, foco. Versão abafada da chama do logo
  cream: '#F8F8ED',        // off-white — background das telas de conteúdo, cards, inputs

  // Tons complementares (do próprio mockup do logo)
  forestDeep: '#050D09',   // verde quase preto — sombras, overlays de modal
  olive: '#6A7044',        // oliva — splash, hero sections, textos secundários
  fireWarm: '#BD7E3F',     // laranja queimado — accents sutis, estados hover
  creamLight: '#FBFAF1',   // creme claro — highlights, hover sobre cards

  // Semântico (não derivam do logo, vêm de padrões de UX)
  danger: '#C0392B',       // delete, erros
  success: '#5C8C3A',      // confirmações, ocorrência "controlada"
} as const;

export type ColorToken = keyof typeof colors;

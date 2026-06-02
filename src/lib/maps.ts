import { Linking, Platform } from 'react-native';

// Abre o app de mapas nativo (Apple Maps / Google Maps) na coordenada.
export function abrirMapa(lat: number, lng: number, label?: string): void {
  const q = encodeURIComponent(label ?? `${lat},${lng}`);
  const url = Platform.select({
    ios: `maps://?q=${q}&ll=${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${q})`,
    default: `https://maps.google.com/?q=${lat},${lng}`,
  });
  Linking.openURL(url);
}

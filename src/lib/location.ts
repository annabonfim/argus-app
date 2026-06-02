import * as Location from 'expo-location';

export interface Coords {
  latitude: number;
  longitude: number;
}

// Pede permissão e devolve a posição atual. Lança erro com mensagem amigável
// se a permissão for negada — a tela trata e mostra ao usuário.
export async function getCurrentCoords(): Promise<Coords> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão de localização negada.');
  }
  const { coords } = await Location.getCurrentPositionAsync({});
  return { latitude: coords.latitude, longitude: coords.longitude };
}

// Converte lat/long em um endereço legível (geocodificação reversa). Retorna
// null se não encontrar — a tela mostra só as coordenadas nesse caso.
export async function getEndereco(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const [lugar] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!lugar) return null;
    // Monta "Rua, Bairro - Cidade/UF" ignorando as partes vazias.
    const partes = [
      lugar.street,
      lugar.district,
      lugar.city,
      lugar.region,
    ].filter(Boolean);
    return partes.length ? partes.join(', ') : null;
  } catch {
    return null;
  }
}

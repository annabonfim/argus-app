import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import MapView, { Callout, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { listarFocos } from '@/api/focos';
import { listAlertas } from '@/api/alertas';
import { getErrorMessage } from '@/api/errors';
import { formatRelative } from '@/lib/format';
import { NIVEL_ALERTA_THEME, STATUS_ALERTA_LABEL } from '@/lib/labels';
import type { Alerta, FocoCalor } from '@/types/domain';
import { colors, fonts, radius, spacing, typography } from '@/theme';

// Região inicial: Brasil inteiro (o bounding box real vem dos focos retornados).
const REGIAO_BRASIL = {
  latitude: -14,
  longitude: -52,
  latitudeDelta: 25,
  longitudeDelta: 25,
};

// Cor do marker pela intensidade (Fire Radiative Power, em MW).
function frpColor(frp: number | null): string {
  if (frp == null || frp === 0) return '#9AA17F'; // cinza-oliva: sem dado
  if (frp < 50) return '#E0A92E'; // âmbar
  if (frp < 200) return colors.fire; // terracota
  return colors.danger; // vermelho: foco crítico
}

export default function FocosMapaScreen() {
  const mapRef = useRef<MapView>(null);
  const [focos, setFocos] = useState<FocoCalor[]>([]);
  const [alertaByFoco, setAlertaByFoco] = useState<Map<number, Alerta>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [buscando, setBuscando] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Focos são o principal; os alertas (cross-ref) são best-effort: se a
      // lista de alertas falhar, o mapa segue mostrando só os metadados do foco.
      const lista = await listarFocos();
      setFocos(lista);
      try {
        const alertas = await listAlertas();
        const index = new Map<number, Alerta>();
        alertas.forEach((a) => {
          if (a.focoCalorId != null) index.set(a.focoCalorId, a);
        });
        setAlertaByFoco(index);
      } catch {
        setAlertaByFoco(new Map());
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Busca por nome de lugar (cidade, estado, região). Usa o geocoder do próprio
  // dispositivo (expo-location) — grátis, sem API key.
  async function handleBuscar() {
    const termo = busca.trim();
    if (!termo) return;
    setBuscando(true);
    try {
      // Geocoding via Nominatim (OpenStreetMap) — grátis, sem API key, e mais
      // confiável que o geocoder nativo. Restrito ao Brasil (countrycodes=br).
      const url =
        'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=' +
        encodeURIComponent(termo);
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'ArgusMobile/1.0 (FIAP Global Solution)',
          'Accept-Language': 'pt-BR',
        },
      });
      const dados = (await resp.json()) as { lat: string; lon: string }[];
      const lugar = dados[0];
      if (!lugar) {
        Toast.show({
          type: 'error',
          text1: 'Local não encontrado',
          text2: 'Tente uma cidade, estado ou região.',
        });
        return;
      }
      mapRef.current?.animateToRegion(
        {
          latitude: parseFloat(lugar.lat),
          longitude: parseFloat(lugar.lon),
          latitudeDelta: 1.5,
          longitudeDelta: 1.5,
        },
        900,
      );
    } catch {
      Toast.show({ type: 'error', text1: 'Não foi possível buscar agora.' });
    } finally {
      setBuscando(false);
    }
  }

  // Limpa a busca e volta pra visão geral do Brasil.
  function handleLimpar() {
    setBusca('');
    mapRef.current?.animateToRegion(REGIAO_BRASIL, 900);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.fire} />
      </View>
    );
  }

  if (error) {
    return (
      <ScreenPlaceholder
        icon="cloud-offline-outline"
        title="Não foi possível carregar"
        message={error}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={REGIAO_BRASIL}
        zoomEnabled
        zoomControlEnabled
        zoomTapEnabled
      >
        {focos.map((f) => {
          const alerta = alertaByFoco.get(f.id);
          return (
            <Marker
              key={f.id}
              coordinate={{ latitude: f.latitude, longitude: f.longitude }}
              pinColor={frpColor(f.frp)}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>
                    {alerta ? 'Alerta ativo' : 'Foco de calor'}
                  </Text>
                  <Text style={styles.calloutLine}>
                    Detectado {formatRelative(f.dataHora)}
                  </Text>
                  {(f.satelite || f.sensor) && (
                    <Text style={styles.calloutLine}>
                      {[f.satelite, f.sensor].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                  {f.confianca && (
                    <Text style={styles.calloutLine}>
                      Confiança: {f.confianca}
                    </Text>
                  )}
                  {f.frp != null && (
                    <Text style={styles.calloutLine}>FRP: {f.frp} MW</Text>
                  )}
                  {alerta && (
                    <Text style={styles.calloutAlerta}>
                      Alerta {NIVEL_ALERTA_THEME[alerta.nivel].label} ·{' '}
                      {STATUS_ALERTA_LABEL[alerta.status]}
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.olive} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cidade, estado, região..."
          placeholderTextColor={colors.olive}
          value={busca}
          onChangeText={setBusca}
          onSubmitEditing={handleBuscar}
          returnKeyType="search"
          autoCapitalize="words"
        />
        {buscando ? (
          <ActivityIndicator size="small" color={colors.fire} />
        ) : busca.length > 0 ? (
          <Pressable onPress={handleLimpar} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.olive} />
          </Pressable>
        ) : null}
      </View>

      {focos.length === 0 && (
        <View style={styles.emptyBanner}>
          <Text style={styles.emptyText}>
            Nenhum foco de calor detectado no momento.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
  },
  searchBar: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.creamLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    shadowColor: colors.forestDeep,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.forest,
    paddingVertical: 0,
  },
  emptyBanner: {
    position: 'absolute',
    top: spacing.md + 64,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.forest,
    borderRadius: 8,
    padding: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.cream,
    textAlign: 'center',
  },
  callout: { width: 200, gap: 2, padding: spacing.xs },
  calloutTitle: {
    ...typography.subtitle,
    color: colors.forest,
  },
  calloutLine: { ...typography.caption, color: colors.forest },
  calloutAlerta: {
    ...typography.caption,
    color: colors.fire,
    fontFamily: fonts.bodySemiBold,
    marginTop: 2,
  },
});

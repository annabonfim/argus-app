import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import MapView, { Callout, Marker } from 'react-native-maps';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { listarFocos } from '@/api/focos';
import { listAlertas } from '@/api/alertas';
import { getErrorMessage } from '@/api/errors';
import { formatRelative } from '@/lib/format';
import { NIVEL_ALERTA_THEME, STATUS_ALERTA_LABEL } from '@/lib/labels';
import type { Alerta, FocoCalor } from '@/types/domain';
import { colors, fonts, spacing, typography } from '@/theme';

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
  const [focos, setFocos] = useState<FocoCalor[]>([]);
  const [alertaByFoco, setAlertaByFoco] = useState<Map<number, Alerta>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <MapView style={StyleSheet.absoluteFill} initialRegion={REGIAO_BRASIL}>
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
  emptyBanner: {
    position: 'absolute',
    top: spacing.lg,
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

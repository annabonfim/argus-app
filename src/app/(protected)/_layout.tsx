import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/theme';

// Perfil mora num avatar no topo (ação de baixa frequência), liberando um slot
// da barra pro Mapa de Focos — que é o showcase do app. O logout vive dentro
// da própria tela de Perfil.
function ProfileButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push('/perfil')}
      hitSlop={8}
      style={{ marginRight: 16 }}
      accessibilityRole="button"
      accessibilityLabel="Perfil"
    >
      <Ionicons name="person-circle-outline" size={28} color={colors.cream} />
    </Pressable>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.forest },
        headerTintColor: colors.cream,
        headerTitleAlign: 'center',
        headerTitleStyle: { fontFamily: fonts.headingBold },
        headerRight: () => <ProfileButton />,
        tabBarActiveTintColor: colors.fire,
        tabBarInactiveTintColor: colors.olive,
        tabBarStyle: {
          backgroundColor: colors.creamLight,
          borderTopColor: colors.fireWarm,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'alert-circle' : 'alert-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ocorrencias"
        options={{
          title: 'Ocorrências',
          tabBarLabel: 'Ocorr.',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'flame' : 'flame-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="focos"
        options={{
          title: 'Mapa de calor',
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'map' : 'map-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Fora da barra: Perfil (avatar no topo) + Brigadas/Recursos (cards do Início). */}
      <Tabs.Screen name="perfil" options={{ href: null, title: 'Perfil' }} />
      <Tabs.Screen name="brigadas" options={{ href: null, title: 'Brigadas' }} />
      <Tabs.Screen name="recursos" options={{ href: null, title: 'Recursos' }} />
    </Tabs>
  );
}

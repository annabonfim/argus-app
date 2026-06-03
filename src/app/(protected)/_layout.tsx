import { Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts } from '@/theme';

// Logout vive no header (ação de saída, secundária) em vez de competir como
// botão primário no corpo da tela.
function LogoutButton() {
  const { signOut } = useAuth();
  return (
    <Pressable
      onPress={signOut}
      hitSlop={8}
      style={{ marginRight: 16 }}
      accessibilityRole="button"
      accessibilityLabel="Sair"
    >
      <Ionicons name="log-out-outline" size={24} color={colors.cream} />
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
        headerRight: () => <LogoutButton />,
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
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Telas acessíveis pelos cards do Início — fora do tab bar (href null). */}
      <Tabs.Screen name="focos" options={{ href: null, title: 'Mapa de calor' }} />
      <Tabs.Screen name="brigadas" options={{ href: null, title: 'Brigadas' }} />
      <Tabs.Screen name="recursos" options={{ href: null, title: 'Recursos' }} />
    </Tabs>
  );
}

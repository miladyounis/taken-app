import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useFonts,
  Nunito_300Light_Italic,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_600SemiBold_Italic,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';

import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import EditReminderScreen from './src/screens/EditReminderScreen';
import AuthScreen from './src/screens/AuthScreen';
import PairingScreen from './src/screens/PairingScreen';
import { AuthProvider, useAuth } from './src/lib/AuthContext';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.cream },
  headerShadowVisible: false,
  headerTintColor: colors.coralDeep,
  headerTitleStyle: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: colors.cocoa },
  contentStyle: { backgroundColor: colors.cream },
};

function MainStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'taken?',
          headerTitleStyle: { fontFamily: 'Nunito_600SemiBold_Italic', fontSize: 26, color: colors.cocoa },
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 22 }}>⚙️</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'reminders' }} />
      <Stack.Screen name="EditReminder" component={EditReminderScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}

function Root() {
  const { loading, session, profile } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream }}>
        <ActivityIndicator color={colors.coral} size="large" />
      </View>
    );
  }

  if (!session) return <AuthScreen />;
  if (!profile?.couple_id) return <PairingScreen />;
  return <MainStack />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_300Light_Italic,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_600SemiBold_Italic,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthProvider>
        <NavigationContainer>
          <Root />
        </NavigationContainer>
      </AuthProvider>
    </View>
  );
}

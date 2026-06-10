import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

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
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.cream },
            headerShadowVisible: false,
            headerTintColor: colors.coralDeep,
            headerTitleStyle: {
              fontFamily: 'Nunito_700Bold',
              fontSize: 18,
              color: colors.cocoa,
            },
            contentStyle: { backgroundColor: colors.cream },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              title: 'taken?',
              headerTitleStyle: {
                fontFamily: 'Nunito_600SemiBold_Italic',
                fontSize: 26,
                color: colors.cocoa,
              },
              headerRight: () => (
                <View>
                  <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ paddingHorizontal: 4 }}>
                    <Text style={{ fontSize: 22 }}>⚙️</Text>
                  </TouchableOpacity>
                </View>
              ),
            })}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'reminders' }}
          />
          <Stack.Screen
            name="EditReminder"
            component={EditReminderScreen}
            options={{ title: '' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

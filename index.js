import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

import App from './App';

// Expo Go (SDK 53+) can't do remote push and warns loudly via expo-notifications'
// auto-registration. It's harmless here and won't occur in a development build.
// Silence just that message so the dev overlay stays clean.
const IGNORED = 'Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go';
LogBox.ignoreLogs([IGNORED]);
const origError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes(IGNORED)) return;
  origError(...args);
};

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

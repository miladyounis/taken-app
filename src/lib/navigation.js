import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// Navigate even from outside React (notification handlers). Queues until ready.
let pending = null;

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    pending = { name, params };
  }
}

export function flushPendingNavigation() {
  if (pending && navigationRef.isReady()) {
    navigationRef.navigate(pending.name, pending.params);
    pending = null;
  }
}

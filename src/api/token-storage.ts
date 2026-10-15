import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Where the session survives app restarts: the device keychain/keystore on iOS and Android,
 * browser localStorage on web (expo-secure-store has no web implementation).
 */
export async function readItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function writeItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // Storage blocked (private mode): the session just won't survive a reload.
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // Nothing stored.
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

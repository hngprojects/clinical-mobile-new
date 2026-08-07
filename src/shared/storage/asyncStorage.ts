import AsyncStorage from '@react-native-async-storage/async-storage';

export const asyncStorage = {
  async getItem<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};

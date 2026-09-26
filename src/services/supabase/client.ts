import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://upchar-placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key-placeholder';

export const isSupabaseConfigured = !!(
  process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// SSR-safe storage adapter: prevents "ReferenceError: window is not defined"
// during Node.js server/static pre-rendering in Expo Router web bundles.
const isServerEnvironment = Platform.OS === 'web' && typeof window === 'undefined';

const serverMemoryStorage = new Map<string, string>();

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isServerEnvironment) {
      return serverMemoryStorage.get(key) || null;
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isServerEnvironment) {
      serverMemoryStorage.set(key, value);
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isServerEnvironment) {
      serverMemoryStorage.delete(key);
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    autoRefreshToken: !isServerEnvironment,
    detectSessionInUrl: false,
  },
});

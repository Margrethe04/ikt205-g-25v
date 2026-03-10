import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const supabaseUrl = "https://fswkjbaynbdafhpbklos.supabase.co"; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzd2tqYmF5bmJkYWZocGJrbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjM2ODAsImV4cCI6MjA4NjI5OTY4MH0.XU4Gybq2sbbQ2y9HT_hdmc9Aio_nPpr9EtgCqUNclmM";

// Sikker "web storage" som ikke krasjer i SSR (Node)
const webStorage = {
  getItem: (key: string) =>
    Promise.resolve(typeof window !== "undefined" ? window.localStorage.getItem(key) : null),

  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    return Promise.resolve();
  },

  removeItem: (key: string) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// Mobil storage (kryptert)
const nativeStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === "web" ? webStorage : nativeStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

import "react-native-url-polyfill/auto"; // Required for Supabase to work in React Native
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";

// Basic check to ensure environment variables are loaded
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Supabase URL or Anon Key is missing. Please check your .env file and babel.config.js setup."
  );
  // You might want to throw an error here or handle it more gracefully
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

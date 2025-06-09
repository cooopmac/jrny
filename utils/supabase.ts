import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://jkupdgxwsgpskvcgxggx.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdXBkZ3h3c2dwc2t2Y2d4Z2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MjMwNjksImV4cCI6MjA2NDk5OTA2OX0.vJP6XVMOylhyqJGmXCnXqkusbDfmhFiRPyN1wwURKY0";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or anon key");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

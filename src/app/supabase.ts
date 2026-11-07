import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Durante a renderização no servidor (Expo Router web com `output: "server"`),
 * o código roda no Node, onde `window` não existe. O AsyncStorage na versão web
 * usa `window.localStorage`, e o Supabase Auth lê a sessão assim que o cliente é
 * criado, o que causava "ReferenceError: window is not defined".
 *
 * No servidor não há sessão para persistir nem token para renovar, então
 * desligamos o storage e o refresh automático. No celular (e no navegador)
 * `window` existe, e o comportamento continua o mesmo de antes.
 */
const isServer = typeof window === 'undefined';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    ...(isServer ? {} : { storage: AsyncStorage }),
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: false,
  },
});
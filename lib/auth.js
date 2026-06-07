'use client';

import { supabase, hasSupabaseEnv } from './supabase';

export async function getSession() {
  if (!hasSupabaseEnv || !supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session || null;
}

export async function signIn(email, password) {
  if (!hasSupabaseEnv || !supabase) {
    throw new Error('Supabase não configurado. Verifique as variáveis na Vercel.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password) {
  if (!hasSupabaseEnv || !supabase) {
    throw new Error('Supabase não configurado. Verifique as variáveis na Vercel.');
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  if (!hasSupabaseEnv || !supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

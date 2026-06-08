'use client';

import { supabase, hasSupabaseEnv } from './supabase';

export async function getCurrentCompany() {
  if (!hasSupabaseEnv || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session?.user?.id) {
    throw new Error('Nenhum usuário logado encontrado.');
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from('company_users')
    .select('company_id, role')
    .eq('user_id', userId)
    .eq('active', true)
    .limit(1)
    .single();

  if (error) throw error;
  if (!data?.company_id) {
    throw new Error('Usuário sem empresa vinculada.');
  }

  return data;
}

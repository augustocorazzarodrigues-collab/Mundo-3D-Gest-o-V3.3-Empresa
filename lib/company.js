'use client';

import { supabase, hasSupabaseEnv } from './supabase';

function ensure() {
  if (!hasSupabaseEnv || !supabase) {
    throw new Error('Variáveis do Supabase não configuradas na Vercel ou em .env.local');
  }
}

export async function getCurrentCompany() {
  ensure();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('Usuário não autenticado.');
  }

  // 1) Busca vínculo do usuário com empresa
  const { data: membership, error: membershipError } = await supabase
    .from('company_users')
    .select('id, company_id, role, user_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership?.company_id) {
    throw new Error('Usuário sem vínculo com empresa.');
  }

  // 2) Busca dados da empresa
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name, plan, active, owner_user_id')
    .eq('id', membership.company_id)
    .limit(1)
    .maybeSingle();

  if (companyError) {
    throw companyError;
  }

  if (!company) {
    throw new Error('Empresa não encontrada para o usuário.');
  }

  return {
    company_user_id: membership.id,
    company_id: membership.company_id,
    role: membership.role || 'viewer',
    user_id: membership.user_id,
    company_name: company.name || 'Empresa',
    company_plan: company.plan || null,
    company_active: company.active ?? true,
    owner_user_id: company.owner_user_id || null
  };
}

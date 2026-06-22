'use client';

import { supabase, hasSupabaseEnv } from './supabase';
import { getCurrentCompany } from './company';
import { resolveTabKeyFromPath } from './access-map';

const TENANT_TABLES = [
  'materials',
  'products',
  'machine_models',
  'machines',
  'stock_items',
  'movement_items',
  'customers',
  'projects',
  'orders',
  'production_orders',
  'price_quotes',
  'leads',
  'customer_guides',
  'financial_entries',
];

function ensure() {
  if (!hasSupabaseEnv || !supabase) {
    throw new Error('Variáveis do Supabase não configuradas na Vercel ou em .env.local');
  }
}

function isTenantTable(table) {
  return TENANT_TABLES.includes(table);
}

function normalizePermissions(rows = []) {
  const map = {};

  rows.forEach((row) => {
    if (!row?.app_tab) return;
    map[row.app_tab] = row.permission_level;
  });

  return map;
}

async function getCurrentTabPermissions() {
  const { data, error } = await supabase.rpc('list_my_tab_permissions');

  if (error) {
    throw new Error(error.message || 'Erro ao buscar permissões atuais do usuário.');
  }

  return normalizePermissions(data || []);
}

async function ensureMutationAllowedForCurrentPath() {
  ensure();

  if (typeof window === 'undefined') return;

  const pathname = window.location?.pathname || '';
  if (!pathname) return;

  const company = await getCurrentCompany().catch(() => null);
  const role = company?.role || 'viewer';

  if (role === 'owner' || role === 'admin') return;

  const tabKey = resolveTabKeyFromPath(pathname);

  // Se a rota não estiver mapeada, não bloqueia para não quebrar telas auxiliares
  if (!tabKey) return;

  const permissions = await getCurrentTabPermissions();
  const level = permissions[tabKey] || 'none';

  if (level !== 'edit') {
    throw new Error(`Você não tem permissão de edição na aba "${tabKey}".`);
  }
}

export async function listRows(table, orderBy = 'created_at', asc = true) {
  ensure();

  let query = supabase.from(table).select('*').order(orderBy, { ascending: asc });

  if (isTenantTable(table)) {
    const { company_id } = await getCurrentCompany();
    query = query.eq('company_id', company_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function insertRow(table, payload) {
  ensure();

  if (isTenantTable(table)) {
    await ensureMutationAllowedForCurrentPath();
  }

  let finalPayload = { ...payload };

  if (isTenantTable(table)) {
    const { company_id } = await getCurrentCompany();
    finalPayload.company_id = company_id;
  }

  const { data, error } = await supabase
    .from(table)
    .insert([finalPayload])
    .select();

  if (error) throw error;
  return data?.[0] || null;
}

export async function updateRow(table, id, payload) {
  ensure();

  if (isTenantTable(table)) {
    await ensureMutationAllowedForCurrentPath();
  }

  const clean = { ...payload };
  delete clean.id;

  let query = supabase.from(table).update(clean).eq('id', id);

  if (isTenantTable(table)) {
    const { company_id } = await getCurrentCompany();
    query = query.eq('company_id', company_id);
  }

  const { data, error } = await query.select();
  if (error) throw error;
  return data?.[0] || null;
}

export async function deleteRow(table, id) {
  ensure();

  if (isTenantTable(table)) {
    await ensureMutationAllowedForCurrentPath();
  }

  let query = supabase.from(table).delete().eq('id', id);

  if (isTenantTable(table)) {
    const { company_id } = await getCurrentCompany();
    query = query.eq('company_id', company_id);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function getMyCompanyMembership() {
  ensure();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!userData?.user) return null;

  const userId = userData.user.id;

  const { data, error } = await supabase
    .from('company_users')
    .select('company_id, role')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function createCompanyOnboarding(companyName) {
  ensure();

  const { data, error } = await supabase.rpc('onboard_new_company', {
    p_company_name: companyName
  });

  if (error) throw error;

  return data;
}

// ===============================
// V4.3 - CONVITES E PLANOS
// ===============================

export async function getMyPendingInvite() {
  ensure();

  const { data, error } = await supabase.rpc('get_my_pending_invite');

  if (error) throw error;

  return data;
}

export async function acceptMyPendingInvite() {
  ensure();

  const { data, error } = await supabase.rpc('accept_my_pending_invite');

  if (error) throw error;

  return data;
}

export async function createCompanyInvite(email, name, role) {
  ensure();

  const { data, error } = await supabase.rpc('create_company_invite', {
    p_email: email,
    p_invited_name: name,
    p_role: role
  });

  if (error) throw error;

  return data;
}

export async function listMyCompanyInvites() {
  ensure();

  const { data, error } = await supabase.rpc('list_my_company_invites');

  if (error) throw error;

  return data || [];
}

export async function cancelCompanyInvite(inviteId) {
  ensure();

  const { data, error } = await supabase.rpc('cancel_company_invite', {
    p_invite_id: inviteId
  });

  if (error) throw error;

  return data;
}

export async function getMyCompanyPlanInfo() {
  ensure();

  const { data, error } = await supabase.rpc('get_my_company_plan_info');

  if (error) throw error;

  return data;
}

export async function listMyCompanyActiveUsers() {
  ensure();

  const { data, error } = await supabase.rpc('list_my_company_active_users');

  if (error) {
    throw new Error(error.message || 'Erro ao buscar usuários ativos da empresa.');
  }

  return data || [];
}

export async function listMyCompanyPermissions() {
  ensure();

  const { data, error } = await supabase.rpc('list_my_company_permissions');

  if (error) {
    throw new Error(error.message || 'Erro ao buscar permissões da empresa.');
  }

  return data || [];
}

export async function saveMyCompanyUserPermission(companyUserId, appTab, permissionLevel) {
  ensure();

  const { error } = await supabase.rpc('save_my_company_user_permission', {
    p_company_user_id: companyUserId,
    p_app_tab: appTab,
    p_permission_level: permissionLevel
  });

  if (error) {
    throw new Error(error.message || 'Erro ao salvar permissão do usuário.');
  }

  return true;
}

export async function listMyTabPermissions() {
  ensure();

  const { data, error } = await supabase.rpc('list_my_tab_permissions');

  if (error) {
    throw new Error(error.message || 'Erro ao buscar permissões do menu lateral.');
  }

  return data || [];
}

export async function getMySidebarContext() {
  ensure();

  const { data, error } = await supabase.rpc('get_my_sidebar_context');

  if (error) {
    throw new Error(error.message || 'Erro ao buscar contexto do menu lateral.');
  }

  return data || [];
}
export async function dismissCompanyUser(companyUserId) {
  ensure();

  const { error } = await supabase.rpc('dismiss_company_user', {
    p_company_user_id: companyUserId
  });

  if (error) {
    throw new Error(error.message || 'Erro ao demitir colaborador.');
  }

  return true;
}

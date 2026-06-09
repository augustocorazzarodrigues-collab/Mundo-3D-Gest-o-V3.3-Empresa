'use client';

import { supabase, hasSupabaseEnv } from './supabase';
import { getCurrentCompany } from './company';

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

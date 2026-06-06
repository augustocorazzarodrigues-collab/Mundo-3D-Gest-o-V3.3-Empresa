import { supabase, hasSupabaseEnv } from './supabase';

function ensure(){
  if(!hasSupabaseEnv || !supabase){
    throw new Error('Variáveis do Supabase não configuradas na Vercel ou em .env.local');
  }
}

export async function listRows(table, orderBy='created_at', asc=true){
  ensure();
  const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending: asc });
  if(error) throw error;
  return data || [];
}
export async function insertRow(table, payload){
  ensure();
  const { data, error } = await supabase.from(table).insert([payload]).select();
  if(error) throw error;
  return data?.[0] || null;
}
export async function updateRow(table, id, payload){
  ensure();
  const clean = { ...payload };
  delete clean.id;
  const { data, error } = await supabase.from(table).update(clean).eq('id', id).select();
  if(error) throw error;
  return data?.[0] || null;
}
export async function deleteRow(table, id){
  ensure();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if(error) throw error;
}

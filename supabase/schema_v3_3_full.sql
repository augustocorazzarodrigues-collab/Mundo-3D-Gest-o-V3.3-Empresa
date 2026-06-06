create extension if not exists pgcrypto;

create table if not exists public.materials (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  price_per_kg numeric(14,2) not null default 0,
  variable boolean not null default false,
  active boolean not null default true
);

create table if not exists public.products (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  category text not null default '',
  material text references public.materials(id) on update cascade on delete set null,
  weight_g numeric(14,3) not null default 0,
  time_h numeric(14,3) not null default 0,
  manual_material_cost numeric(14,2) not null default 0,
  material_cost numeric(14,2) not null default 0,
  price_base numeric(14,2) not null default 0,
  status text not null default 'Ativo'
);

create table if not exists public.machine_models (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  area_util text not null default '',
  material_compativel text not null default '',
  potencia_w numeric(14,2) not null default 0,
  custo_hora numeric(14,2) not null default 0
);

create table if not exists public.machines (
  id text primary key,
  created_at timestamptz not null default now(),
  model_id text references public.machine_models(id) on update cascade on delete set null,
  status text not null default 'Disponível',
  horas_uso numeric(14,2) not null default 0,
  prox_manutencao numeric(14,2) not null default 0,
  ultima_manutencao date,
  observacao text not null default ''
);

create table if not exists public.stock_items (
  id text primary key,
  created_at timestamptz not null default now(),
  item_name text not null,
  unidade text not null default 'KG',
  saldo_atual numeric(14,3) not null default 0,
  estoque_minimo numeric(14,3) not null default 0,
  custo_unit numeric(14,2) not null default 0
);

create table if not exists public.movement_items (
  id text primary key,
  created_at timestamptz not null default now(),
  date date not null,
  type text not null,
  stock_item_id text references public.stock_items(id) on update cascade on delete set null,
  document text not null default '-',
  qty_kg numeric(14,3) not null default 0,
  cost_unit numeric(14,2) not null default 0,
  value numeric(14,2) not null default 0
);

create table if not exists public.customers (
  id text primary key,
  created_at timestamptz not null default now(),
  code text not null,
  name text not null,
  category text not null default '',
  email text not null default '',
  phone text not null default '',
  city text not null default '',
  status text not null default 'Ativo'
);

create table if not exists public.projects (
  id text primary key,
  created_at timestamptz not null default now(),
  code text not null,
  name text not null,
  client_id text references public.customers(id) on update cascade on delete set null,
  product_id text references public.products(id) on update cascade on delete set null,
  type text not null default 'Padrão',
  status text not null default 'Ativo',
  description text not null default '',
  target_price numeric(14,2) not null default 0
);

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  number text not null,
  client_id text references public.customers(id) on update cascade on delete set null,
  product_id text references public.products(id) on update cascade on delete set null,
  project_id text references public.projects(id) on update cascade on delete set null,
  quantity numeric(14,2) not null default 0,
  unit_price numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  status text not null default 'Aprovado',
  order_date date,
  due_date date
);

create table if not exists public.production_orders (
  id text primary key,
  created_at timestamptz not null default now(),
  number text not null,
  order_id text references public.orders(id) on update cascade on delete set null,
  product_id text references public.products(id) on update cascade on delete set null,
  project_id text references public.projects(id) on update cascade on delete set null,
  client_id text references public.customers(id) on update cascade on delete set null,
  machine_id text references public.machines(id) on update cascade on delete set null,
  quantity numeric(14,2) not null default 0,
  due_date date,
  status text not null default 'Planejada',
  material_stock_id text references public.stock_items(id) on update cascade on delete set null,
  consumo_kg numeric(14,3) not null default 0
);

create table if not exists public.price_quotes (
  id text primary key,
  created_at timestamptz not null default now(),
  product_id text references public.products(id) on update cascade on delete set null,
  machine_id text references public.machines(id) on update cascade on delete set null,
  extra_cost numeric(14,2) not null default 0,
  overhead numeric(14,2) not null default 0,
  target_margin numeric(14,2) not null default 0,
  sale_price numeric(14,2) not null default 0
);

create table if not exists public.leads (
  id text primary key,
  created_at timestamptz not null default now(),
  code text not null,
  name text not null,
  source text not null default '',
  stage text not null default 'Novo contato',
  expected_value numeric(14,2) not null default 0,
  next_action text not null default ''
);

create table if not exists public.customer_guides (
  id text primary key,
  created_at timestamptz not null default now(),
  client_id text references public.customers(id) on update cascade on delete cascade,
  script text not null default '',
  stage text not null default 'Relacionamento',
  notes text not null default ''
);

create table if not exists public.financial_entries (
  id text primary key,
  created_at timestamptz not null default now(),
  code text not null,
  source text not null default 'manual',
  date date,
  type text not null default 'Receita',
  category text not null default '',
  client_id text references public.customers(id) on update cascade on delete set null,
  order_id text references public.orders(id) on update cascade on delete set null,
  description text not null default '',
  value numeric(14,2) not null default 0,
  status text not null default 'Previsto'
);

-- Indexes
create index if not exists idx_products_material on public.products(material);
create index if not exists idx_orders_client on public.orders(client_id);
create index if not exists idx_orders_product on public.orders(product_id);
create index if not exists idx_ops_order on public.production_orders(order_id);
create index if not exists idx_fin_order on public.financial_entries(order_id);

-- RLS enabled with open internal-MVP policies
alter table public.materials enable row level security;
alter table public.products enable row level security;
alter table public.machine_models enable row level security;
alter table public.machines enable row level security;
alter table public.stock_items enable row level security;
alter table public.movement_items enable row level security;
alter table public.customers enable row level security;
alter table public.projects enable row level security;
alter table public.orders enable row level security;
alter table public.production_orders enable row level security;
alter table public.price_quotes enable row level security;
alter table public.leads enable row level security;
alter table public.customer_guides enable row level security;
alter table public.financial_entries enable row level security;

do $$
declare t text;
declare names text[] := array['materials','products','machine_models','machines','stock_items','movement_items','customers','projects','orders','production_orders','price_quotes','leads','customer_guides','financial_entries'];
begin
  foreach t in array names loop
    if not exists (
      select 1 from pg_policies where schemaname='public' and tablename=t and policyname=t || '_all'
    ) then
      execute format('create policy %I on public.%I for all using (true) with check (true)', t || '_all', t);
    end if;
  end loop;
end $$;

-- Seed base data
insert into public.materials (id, name, price_per_kg, variable, active) values
('mat_pla', 'PLA', 100, false, true),
('mat_petg', 'PETG', 90, false, true),
('mat_abs', 'ABS', 110, false, true),
('mat_tpu', 'TPU', 150, false, true),
('mat_var', 'Variável', 0, true, true)
on conflict (id) do nothing;

insert into public.products (id, name, category, material, weight_g, time_h, manual_material_cost, material_cost, price_base, status) values
('prod_01', 'Chaveiro Bola Giratória FIFA', 'Chaveiro', 'mat_pla', 17.5, 1.61, 0, 1.75, 9, 'Ativo'),
('prod_02', 'Caixinha da Copa', 'Porta figurinhas', 'mat_pla', 103.7, 4.08, 0, 10.37, 45, 'Ativo'),
('prod_03', 'Quadro (P)', 'Personalizado', 'mat_var', 150, 10, 15, 15, 170, 'Ativo')
on conflict (id) do nothing;

insert into public.machine_models (id, name, area_util, material_compativel, potencia_w, custo_hora) values
('mdl_a1mini', 'Bambu Lab A1 Mini', '180x180x180', 'PLA/PETG', 80, 6.8),
('mdl_a1combo', 'Bambu Lab A1 Combo', '256x256x256', 'PLA/PETG', 100, 8.4),
('mdl_ender3', 'Creality Ender 3', '220x220x250', 'PLA/PETG/TPU', 160, 10.5)
on conflict (id) do nothing;

insert into public.machines (id, model_id, status, horas_uso, prox_manutencao, ultima_manutencao, observacao) values
('maq_01', 'mdl_a1mini', 'Disponível', 120, 300, '2026-05-15', ''),
('maq_02', 'mdl_a1combo', 'Disponível', 260, 300, '2026-05-03', ''),
('maq_03', 'mdl_ender3', 'Disponível', 180, 300, '2026-04-18', '')
on conflict (id) do nothing;

insert into public.stock_items (id, item_name, unidade, saldo_atual, estoque_minimo, custo_unit) values
('stk_01', 'PLA Branco', 'KG', 5, 2, 100),
('stk_02', 'PETG Branco', 'KG', 3, 2, 90),
('stk_03', 'TPU Preto', 'KG', 1, 2, 150)
on conflict (id) do nothing;

insert into public.customers (id, code, name, category, email, phone, city, status) values
('cli_01', 'CLI-001', 'Cliente Exemplo', 'Revenda', 'cliente@exemplo.com', '(11) 99999-0001', 'Itupeva', 'Ativo'),
('cli_02', 'CLI-002', 'Cliente Personalizado', 'Projeto especial', 'personalizado@exemplo.com', '(11) 99999-0002', 'Jundiaí', 'Ativo'),
('cli_03', 'CLI-003', 'Loja Parceira', 'B2B', 'loja@exemplo.com', '(11) 99999-0003', 'Campinas', 'Ativo')
on conflict (id) do nothing;

insert into public.projects (id, code, name, client_id, product_id, type, status, description, target_price) values
('prj_01', 'PRJ-001', 'Kit Copa 2026', 'cli_01', 'prod_02', 'Padrão', 'Ativo', 'Linha promocional', 45),
('prj_02', 'PRJ-002', 'Quadro Personalizado', 'cli_02', 'prod_03', 'Personalizado', 'Em desenvolvimento', 'Projeto sob encomenda', 170)
on conflict (id) do nothing;

insert into public.orders (id, number, client_id, product_id, project_id, quantity, unit_price, total, status, order_date, due_date) values
('ped_01', 'PED-001', 'cli_03', 'prod_03', null, 1, 150, 150, 'Em produção', '2026-06-05', null),
('ped_02', 'PED-002', 'cli_01', 'prod_02', 'prj_01', 5, 45, 225, 'Cancelado', '2026-06-05', '2026-06-12')
on conflict (id) do nothing;

insert into public.production_orders (id, number, order_id, product_id, project_id, client_id, machine_id, quantity, due_date, status, material_stock_id, consumo_kg) values
('op_01', 'OP-001', null, 'prod_01', null, 'cli_01', 'maq_01', 50, '2026-06-12', 'Planejada', 'stk_01', 2),
('op_02', 'OP-002', null, 'prod_02', 'prj_01', 'cli_01', 'maq_02', 20, '2026-06-15', 'Em andamento', 'stk_02', 1),
('op_03', 'OP-003', null, 'prod_03', 'prj_02', 'cli_02', 'maq_03', 5, '2026-06-18', 'Planejada', 'stk_03', 0.7)
on conflict (id) do nothing;

insert into public.price_quotes (id, product_id, machine_id, extra_cost, overhead, target_margin, sale_price) values
('pq_01', 'prod_01', 'maq_01', 1.5, 2, 70, 5),
('pq_02', 'prod_02', 'maq_02', 4, 5, 40, 45),
('pq_03', 'prod_03', 'maq_03', 8, 10, 55, 170)
on conflict (id) do nothing;

insert into public.leads (id, code, name, source, stage, expected_value, next_action) values
('lead_01', 'LED-001', 'Lead Copa', 'Instagram', 'Novo contato', 450, 'Enviar catálogo'),
('lead_02', 'LED-002', 'Lead Revenda', 'Feira', 'Qualificado', 900, 'Montar proposta'),
('lead_03', 'LED-003', 'Lead Quadro', 'Indicação', 'Orçamento enviado', 170, 'Follow-up'),
('lead_04', 'LED-004', 'Lead Perdido', 'Site', 'Perdido', 200, 'Sem retorno')
on conflict (id) do nothing;

insert into public.customer_guides (id, client_id, script, stage, notes) values
('guide_01', 'cli_01', 'Manter contato quinzenal e oferecer kits sazonais.', 'Relacionamento', 'Cliente com boa recorrência.'),
('guide_02', 'cli_02', 'Confirmar aprovação do layout antes da produção.', 'Projeto Especial', 'Produto personalizado.')
on conflict (id) do nothing;

insert into public.financial_entries (id, code, source, date, type, category, client_id, order_id, description, value, status) values
('fin_01', 'FIN-001', 'manual', '2026-06-05', 'Despesa', 'Matéria-prima', null, null, 'Compra PLA', 180, 'Pago'),
('fin_02', 'FIN-002', 'order', '2026-06-05', 'Receita', 'Pedido', 'cli_03', 'ped_01', 'Pedido PED-001', 150, 'Previsto'),
('fin_03', 'FIN-003', 'order', '2026-06-05', 'Receita', 'Pedido', 'cli_01', 'ped_02', 'Pedido PED-002', 225, 'Cancelado')
on conflict (id) do nothing;

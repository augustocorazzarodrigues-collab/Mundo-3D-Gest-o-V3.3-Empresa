'use client';

import { getCurrentCompany } from './company';
import { listMyTabPermissions } from './service';

export const ROLE_ACCESS = {
  owner: ['*'],
  admin: ['*'],
  comercial: [
    '/inicio',
    '/dashboard-geral',
    '/comercial/dashboard-comercial',
    '/comercial/clientes',
    '/comercial/pedidos',
    '/comercial/prospeccoes',
    '/comercial/cartilha-clientes',
    '/comercial/rentabilidade-clientes',
    '/comercial/financeiro',
  ],
  operacional: [
    '/inicio',
    '/dashboard-geral',
    '/operacional/dashboard-operacional',
    '/operacional/produtos',
    '/operacional/maquinas',
    '/operacional/estoque',
    '/operacional/mov-estoque',
    '/operacional/ordens-producao',
    '/operacional/projetos',
    '/operacional/precificacao',
  ],
  financeiro: [
    '/inicio',
    '/dashboard-geral',
    '/comercial/clientes',
    '/comercial/pedidos',
    '/comercial/rentabilidade-clientes',
    '/comercial/financeiro',
  ],
  viewer: [
    '/inicio',
    '/dashboard-geral',
  ],
};

export const TAB_KEY_BY_HREF = {
  '/': 'Início',
  '/inicio': 'Início',
  '/dashboard-geral': 'Dashboard Geral',
  '/usuarios': 'Usuários',

  '/operacional/dashboard-operacional': 'Dashboard Operacional',
  '/operacional/produtos': 'Produtos',
  '/operacional/maquinas': 'Máquinas',
  '/operacional/estoque': 'Estoque',
  '/operacional/mov-estoque': 'Mov. Estoque',
  '/operacional/ordens-producao': 'Ordens Produção',
  '/operacional/projetos': 'Projetos',
  '/operacional/precificacao': 'Precificação',

  '/comercial/dashboard-comercial': 'Dashboard Comercial',
  '/comercial/clientes': 'Clientes',
  '/

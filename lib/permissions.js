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
  '/comercial/pedidos': 'Pedidos',
  '/comercial/prospeccoes': 'Prospecções',
  '/comercial/cartilha-clientes': 'Cartilha Clientes',
  '/comercial/rentabilidade-clientes': 'Rentabilidade Clientes',
  '/comercial/financeiro': 'Financeiro'
};

export function normalizePermissions(rows = []) {
  const map = {};

  rows.forEach((row) => {
    if (!row?.app_tab) return;
    map[row.app_tab] = row.permission_level;
  });

  return map;
}

export async function getMyMenuPermissions() {
  const membership = await getCurrentCompany();

  if (!membership) {
    return {
      role: null,
      permissions: {}
    };
  }

  // Owner continua vendo tudo
  if (membership.role === 'owner') {
    return {
      role: 'owner',
      permissions: {}
    };
  }

  const rows = await listMyTabPermissions();

  return {
    role: membership.role,
    permissions: normalizePermissions(rows)
  };
}

export function canViewTab(role, permissions, tabName) {
  if (role === 'owner') return true;

  const permission = permissions?.[tabName] || 'view';

  return permission === 'view' || permission === 'edit';
}

export function canEditTab(role, permissions, tabName) {
  if (role === 'owner') return true;

  const permission = permissions?.[tabName] || 'view';

  return permission === 'edit';
}

/**
 * Compatibilidade com a lógica antiga por perfil.
 * Primeiro aplica o papel base (comercial, operacional, financeiro etc.).
 */
export function hasRouteAccess(role, pathname) {
  const routes = ROLE_ACCESS[role] || ROLE_ACCESS.viewer;
  if (routes.includes('*')) return true;
  return routes.includes(pathname);
}

/**
 * Compatibilidade com a lógica antiga do menu por perfil.
 * Primeiro filtra pelo papel base.
 */
export function filterLinksByRole(links, role) {
  const routes = ROLE_ACCESS[role] || ROLE_ACCESS.viewer;
  const hasAll = routes.includes('*');

  const filtered = [];
  let pendingTitle = null;

  for (const item of links) {
    if (item.title) {
      pendingTitle = item;
      continue;
    }

    const allowed = hasAll || routes.includes(item.href);

    if (allowed) {
      if (pendingTitle) {
        filtered.push(pendingTitle);
        pendingTitle = null;
      }
      filtered.push(item);
    }
  }

  return filtered;
}

/**
 * Segundo filtro: permissões reais por aba vindas do banco.
 * Aqui entram as regras de "none / view / edit".
 */
export function filterMenuItemsByPermissions(items, role, permissions) {
  if (role === 'owner') return items;

  return (items || []).filter((item) => {
    if (item.title) return false;

    const tabName = item.tabKey || TAB_KEY_BY_HREF[item.href];

    // Se não tiver mapeamento, mantém visível para não quebrar nada
    if (!tabName) return true;

    return canViewTab(role, permissions, tabName);
  });
}

/**
 * Recoloca os títulos de seção apenas quando existir
 * ao menos 1 item visível dentro daquele bloco.
 */
export function groupVisibleLinks(items, role, permissions) {
  if (role === 'owner') return items;

  const result = [];
  let pendingTitle = null;

  for (const item of items) {
    if (item.title) {
      pendingTitle = item;
      continue;
    }

    const visible = filterMenuItemsByPermissions([item], role, permissions);

    if (visible.length > 0) {
      if (pendingTitle) {
        result.push(pendingTitle);
        pendingTitle = null;
      }
      result.push(item);
    }
  }

  return result;
}

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
  '/comercial/pedidos': 'Pedidos',
  '/comercial/prospeccoes': 'Prospecções',
  '/comercial/cartilha-clientes': 'Cartilha Clientes',
  '/comercial/rentabilidade-clientes': 'Rentabilidade Clientes',
  '/comercial/financeiro': 'Financeiro'
};

function routeMatches(pathname, route) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

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

export function hasRouteAccess(role, pathname) {
  const routes = ROLE_ACCESS[role] || ROLE_ACCESS.viewer;
  if (routes.includes('*')) return true;

  return routes.some((route) => routeMatches(pathname, route));
}

export function resolveTabKeyFromPath(pathname) {
  const entries = Object.entries(TAB_KEY_BY_HREF).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [href, tabKey] of entries) {
    if (routeMatches(pathname, href)) {
      return tabKey;
    }
  }

  return null;
}

export function canAccessPath(role, permissions, pathname) {
  if (role === 'owner') return true;

  const baseAllowed = hasRouteAccess(role, pathname);
  if (!baseAllowed) return false;

  const tabKey = resolveTabKeyFromPath(pathname);

  // Se não houver mapeamento de aba, mantém acessível para não quebrar o app
  if (!tabKey) return true;

  return canViewTab(role, permissions, tabKey);
}

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

    const allowed = hasAll || routes.some((route) => routeMatches(item.href, route));

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

export function filterMenuItemsByPermissions(items, role, permissions) {
  if (role === 'owner') return items;

  return (items || []).filter((item) => {
    if (item.title) return false;

    const tabName = item.tabKey || TAB_KEY_BY_HREF[item.href];

    if (!tabName) return true;

    return canViewTab(role, permissions, tabName);
  });
}

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

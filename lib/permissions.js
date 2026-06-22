'use client';

import { getCurrentCompany } from './company';
import { listMyTabPermissions } from './service';
import {
  TAB_KEY_BY_HREF,
  routeMatches,
  resolveTabKeyFromPath
} from './access-map';

export { TAB_KEY_BY_HREF, routeMatches, resolveTabKeyFromPath };

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

  const permission = permissions?.[tabName] || 'none';

  return permission === 'view' || permission === 'edit';
}

export function canEditTab(role, permissions, tabName) {
  if (role === 'owner') return true;

  const permission = permissions?.[tabName] || 'none';

  return permission === 'edit';
}

/**
 * Compatibilidade com o fluxo atual:
 * a rota base não será mais limitada por perfil fixo.
 * Quem manda agora é a permissão por aba.
 */
export function hasRouteAccess(role, pathname) {
  if (!pathname) return false;
  return true;
}

export function getPermissionLevelForPath(role, permissions, pathname) {
  if (role === 'owner') return 'edit';

  const tabKey = resolveTabKeyFromPath(pathname);

  // Se a rota não estiver no mapa, tratamos como view
  // para não quebrar telas auxiliares fora do menu principal.
  if (!tabKey) return 'view';

  return permissions?.[tabKey] || 'none';
}

export function canAccessPath(role, permissions, pathname) {
  return getPermissionLevelForPath(role, permissions, pathname) !== 'none';
}

export function hasWriteAccess(role, permissions, pathname) {
  return getPermissionLevelForPath(role, permissions, pathname) === 'edit';
}

/**
 * Mantido por compatibilidade com Sidebar atual.
 * Agora não filtra mais por perfil fixo.
 */
export function filterLinksByRole(links, role) {
  return links || [];
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

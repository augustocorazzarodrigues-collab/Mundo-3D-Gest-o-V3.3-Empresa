'use client';

import { getCurrentCompany } from './company';
import { listMyTabPermissions } from './service';
import {
  ROLE_ACCESS,
  TAB_KEY_BY_HREF,
  routeMatches,
  resolveTabKeyFromPath
} from './access-map';

export { ROLE_ACCESS, TAB_KEY_BY_HREF, routeMatches, resolveTabKeyFromPath };

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

export function getPermissionLevelForPath(role, permissions, pathname) {
  if (role === 'owner') return 'edit';

  const baseAllowed = hasRouteAccess(role, pathname);
  if (!baseAllowed) return 'none';

  const tabKey = resolveTabKeyFromPath(pathname);

  // Se não tiver mapeamento de aba, mantém editável para não quebrar telas fora do mapa
  if (!tabKey) return 'edit';

  return permissions?.[tabKey] || 'view';
}

export function canAccessPath(role, permissions, pathname) {
  return getPermissionLevelForPath(role, permissions, pathname) !== 'none';
}

export function hasWriteAccess(role, permissions, pathname) {
  return getPermissionLevelForPath(role, permissions, pathname) === 'edit';
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

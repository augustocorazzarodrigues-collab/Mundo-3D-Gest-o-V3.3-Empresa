'use client';

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

export function hasRouteAccess(role, pathname) {
  const routes = ROLE_ACCESS[role] || ROLE_ACCESS.viewer;
  if (routes.includes('*')) return true;
  return routes.includes(pathname);
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

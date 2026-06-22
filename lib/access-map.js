'use client';

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

export function routeMatches(pathname, route) {
  return pathname === route || pathname.startsWith(`${route}/`);
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

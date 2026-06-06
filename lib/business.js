import { byId } from './format';

export function computeMaterialCost(product, materials) {
  if (!product) return 0;

  // PRIORIDADE 1: usar o custo já salvo/calculado no produto
  const savedCost = Number(product.material_cost ?? product.materialCost ?? 0);
  if (savedCost > 0) return savedCost;

  const material = materials.find(
    (m) => m.id === product?.material_id || m.id === product?.material || m.id === product?.materialId
  );

  if (!material) return 0;

  if (material.variable) {
    return Number(product.manual_material_cost ?? product.manualMaterialCost ?? 0);
  }

  return (Number(product.weight_g ?? product.weightG ?? 0) / 1000) * Number(material.price_per_kg ?? material.pricePerKg ?? 0);
}

export function getProductCostTotal(db, productId, machineId) {
  const product = byId(db.products, productId);
  if (!product) return 0;

  const materialCost = computeMaterialCost(product, db.materials || []);
  const machine = byId(db.machines || [], machineId);
  const model = machine ? byId(db.machineModels || [], machine.model_id || machine.modelId) : null;
  const machineCost = Number(product.time_h ?? product.timeH ?? 0) * Number(model?.custo_hora ?? model?.custoHora ?? 0);
  const quote = (db.priceQuotes || []).find((q) => q.product_id === productId || q.productId === productId);

  return materialCost + machineCost + Number(quote?.extra_cost ?? quote?.extraCost ?? 0) + Number(quote?.overhead ?? 0);
}

export function mapOrderToFinanceStatus(orderStatus) {
  if (['Aprovado', 'Em produção', 'Entregue'].includes(orderStatus)) return 'Previsto';
  if (['Faturado', 'Pago'].includes(orderStatus)) return 'Recebido';
  if (orderStatus === 'Cancelado') return 'Cancelado';
  return 'Previsto';
}

export function getFinancialSummary(db) {
  const entries = db.financialEntries || [];
  const despesas = entries.filter((e) => e.type === 'Despesa').reduce((acc, row) => acc + Number(row.value || 0), 0);
  const receitasPrevistas = entries.filter((e) => e.type === 'Receita' && e.status === 'Previsto').reduce((acc, row) => acc + Number(row.value || 0), 0);
  const receitasReais = entries.filter((e) => e.type === 'Receita' && e.status === 'Recebido').reduce((acc, row) => acc + Number(row.value || 0), 0);
  return {
    receitasPrevistas,
    receitasReais,
    despesas,
    saldoPrevisto: receitasPrevistas - despesas,
    saldoReal: receitasReais - despesas,
    entries,
  };
}

export function dashboardMetrics(db) {
  const fin = getFinancialSummary(db);
  return {
    receita: fin.receitasPrevistas,
    lucro: fin.saldoPrevisto,
    opsAbertas: (db.productionOrders || []).filter((op) => !['Concluída', 'Cancelada'].includes(op.status)).length,
    leadsAbertos: (db.leads || []).filter((lead) => !['Fechado', 'Perdido'].includes(lead.stage)).length,
  };
}

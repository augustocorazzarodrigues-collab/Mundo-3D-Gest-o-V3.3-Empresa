export const moneyBR = (v) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v || 0));
export const pctBR = (v) => `${Number(v || 0).toFixed(1)}%`;
export const newId = (prefix='id') => `${prefix}_${Math.random().toString(36).slice(2,10)}_${Date.now().toString(36)}`;
export const getVisualCode = (index,prefix,digits=3) => `${prefix}-${String(index + 1).padStart(digits,'0')}`;
export const getProductSku = (index) => getVisualCode(index,'SKU');
export const getStockCode = (index) => getVisualCode(index,'MAT');
export const getMachineName = (index) => `Impressora - ${String(index + 1).padStart(2,'0')}`;
export const getClientCode = (index) => getVisualCode(index,'CLI');
export const getProjectCode = (index) => getVisualCode(index,'PRJ');
export const getOrderCode = (index) => getVisualCode(index,'PED');
export const getLeadCode = (index) => getVisualCode(index,'LED');
export const getFinanceCode = (index) => getVisualCode(index,'FIN');
export const getOPNumber = (index) => getVisualCode(index,'OP');
export const sortCreated = (items=[]) => [...items].sort((a,b)=>new Date(a.created_at || a.createdAt || 0)-new Date(b.created_at || b.createdAt || 0));
export const byId = (items,id) => (items || []).find((item)=>item.id===id);
export const nameById = (items,id,field='name') => byId(items,id)?.[field] || '-';
export function getStockStatus(item){
  const saldo=Number(item.saldoAtual ?? item.saldo_atual ?? 0), minimo=Number(item.estoqueMinimo ?? item.estoque_minimo ?? 0);
  if(saldo<=0) return {label:'Sem estoque', tone:'danger'};
  if(saldo<=minimo) return {label:'Repor', tone:'warning'};
  return {label:'Disponível', tone:'success'};
}
export function getMaintenanceStatus(machine){
  const ratio=Number(machine.horasUso ?? machine.horas_uso ?? 0)/Math.max(1,Number(machine.proxManutencao ?? machine.prox_manutencao ?? 0));
  if((machine.status||'')==='Em manutenção') return {label:'Em manutenção', tone:'info', progress:100};
  if(ratio>=1) return {label:'Vencida', tone:'danger', progress:100};
  if(ratio>=0.8) return {label:'Próxima', tone:'warning', progress:Math.round(ratio*100)};
  return {label:'Em dia', tone:'success', progress:Math.round(ratio*100)};
}
export function getOrderStatusTone(status){
  if(['Aprovado','Faturado','Pago','Entregue'].includes(status)) return 'success';
  if(['Em produção','Em negociação'].includes(status)) return 'info';
  if(['Cancelado','Perdido'].includes(status)) return 'danger';
  return 'warning';
}
export function getMarginAlert(margin){
  const m = Number(margin || 0);
  if(m < 30) return {label:'Ruim (Revisar preço)', tone:'ruim'};
  if(m < 60) return {label:'OK', tone:'ok'};
  return {label:'Ótima', tone:'otima'};
}

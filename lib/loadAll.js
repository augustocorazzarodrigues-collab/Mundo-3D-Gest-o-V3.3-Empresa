import { listRows } from './service';

export async function loadAllDb(){
  const [materials, products, machineModels, machines, stockItems, movementItems, customers, projects, productionOrders, priceQuotes, leads, orders, customerGuides, financialEntries] = await Promise.all([
    listRows('materials'),
    listRows('products'),
    listRows('machine_models'),
    listRows('machines'),
    listRows('stock_items'),
    listRows('movement_items'),
    listRows('customers'),
    listRows('projects'),
    listRows('production_orders'),
    listRows('price_quotes'),
    listRows('leads'),
    listRows('orders'),
    listRows('customer_guides'),
    listRows('financial_entries'),
  ]);
  return { materials, products, machineModels, machines, stockItems, movementItems, customers, projects, productionOrders, priceQuotes, leads, orders, customerGuides, financialEntries };
}

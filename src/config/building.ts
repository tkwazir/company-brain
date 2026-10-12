import type { Floor, Tower } from '../api/types'

// Single source of truth for the building layout. The 3D scene reads this
// directly; the mock API (src/api/mockData.ts) re-exports the same list so
// the two never drift apart.

export const towerMeta: Record<Tower, { label: string; subtitle: string }> = {
  left: { label: 'Landing', subtitle: 'Raw source dumps' },
  center: { label: 'The Brain', subtitle: 'Curated warehouse' },
  right: { label: 'Vault', subtitle: 'Restricted data' },
}

export const floors: Floor[] = [
  // Left tower — raw / landing zone (internal, unmodeled dumps)
  { id: 'raw-crm', tower: 'left', level: 0, name: 'Raw_CRM_Export', domain: 'CRM', sensitivity: 'internal', rowCount: 184_230 },
  { id: 'raw-erp', tower: 'left', level: 1, name: 'Raw_ERP_Extract', domain: 'ERP', sensitivity: 'internal', rowCount: 92_410 },
  { id: 'web-logs', tower: 'left', level: 2, name: 'Web_Logs', domain: 'Web', sensitivity: 'internal', rowCount: 2_310_904 },
  { id: 'raw-support', tower: 'left', level: 3, name: 'Raw_Support_Export', domain: 'Support', sensitivity: 'internal', rowCount: 54_120 },
  { id: 'raw-marketing', tower: 'left', level: 4, name: 'Raw_Marketing_Export', domain: 'Marketing', sensitivity: 'internal', rowCount: 38_760 },
  { id: 'raw-inventory', tower: 'left', level: 5, name: 'Raw_Inventory_Feed', domain: 'Inventory', sensitivity: 'internal', rowCount: 71_050 },

  // Center tower — curated warehouse (the brain)
  { id: 'customers', tower: 'center', level: 0, name: 'Customers', domain: 'Sales', sensitivity: 'internal', rowCount: 48_210 },
  { id: 'sales-orders', tower: 'center', level: 1, name: 'Sales_Orders', domain: 'Sales', sensitivity: 'internal', rowCount: 132_480 },
  { id: 'revenue-monthly', tower: 'center', level: 2, name: 'Revenue_Monthly', domain: 'Finance', sensitivity: 'internal', rowCount: 4_320 },
  { id: 'marketing-spend', tower: 'center', level: 3, name: 'Marketing_Spend', domain: 'Marketing', sensitivity: 'internal', rowCount: 9_840 },
  { id: 'support-tickets', tower: 'center', level: 4, name: 'Support_Tickets', domain: 'Ops', sensitivity: 'internal', rowCount: 67_310 },
  { id: 'inventory', tower: 'center', level: 5, name: 'Inventory', domain: 'Ops', sensitivity: 'internal', rowCount: 28_900 },
  { id: 'product-catalog', tower: 'center', level: 6, name: 'Product_Catalog', domain: 'Product', sensitivity: 'public', rowCount: 2_140 },
  { id: 'finance-budgets', tower: 'center', level: 7, name: 'Finance_Budgets', domain: 'Finance', sensitivity: 'internal', rowCount: 1_860 },
  { id: 'churn-signals', tower: 'center', level: 8, name: 'Churn_Signals', domain: 'Sales', sensitivity: 'internal', rowCount: 48_210 },
  { id: 'vendor-contracts', tower: 'center', level: 9, name: 'Vendor_Contracts', domain: 'Ops', sensitivity: 'internal', rowCount: 3_480 },
  { id: 'web-traffic-summary', tower: 'center', level: 10, name: 'Web_Traffic_Summary', domain: 'Marketing', sensitivity: 'public', rowCount: 15_720 },
  { id: 'margin-by-product', tower: 'center', level: 11, name: 'Margin_By_Product', domain: 'Finance', sensitivity: 'internal', rowCount: 6_050 },

  // Right tower — restricted vault (HR / compensation / PII)
  { id: 'hr-employees', tower: 'right', level: 0, name: 'HR_Employees', domain: 'HR', sensitivity: 'restricted', rowCount: 1_240 },
  { id: 'hr-compensation', tower: 'right', level: 1, name: 'HR_Compensation', domain: 'HR', sensitivity: 'restricted', rowCount: 1_240 },
  { id: 'payroll', tower: 'right', level: 2, name: 'Payroll', domain: 'Finance', sensitivity: 'restricted', rowCount: 14_880 },
  { id: 'background-checks', tower: 'right', level: 3, name: 'Background_Checks', domain: 'HR', sensitivity: 'restricted', rowCount: 980 },
  { id: 'benefits-enrollment', tower: 'right', level: 4, name: 'Benefits_Enrollment', domain: 'HR', sensitivity: 'restricted', rowCount: 1_190 },
  { id: 'performance-reviews', tower: 'right', level: 5, name: 'Performance_Reviews', domain: 'HR', sensitivity: 'restricted', rowCount: 2_430 },
  { id: 'executive-equity', tower: 'right', level: 6, name: 'Executive_Equity_Grants', domain: 'Finance', sensitivity: 'restricted', rowCount: 210 },
]

export function floorsByTower(tower: Tower): Floor[] {
  return floors.filter((f) => f.tower === tower).sort((a, b) => a.level - b.level)
}

// Tipus de dades de ZeroStock (reflecteixen les taules de Supabase)

export type Tenant = "BUMBBA" | "SUNBBA" | "SHARED";

export interface Component {
  id: number;
  sku: string;
  name: string;
  tenant_id: Tenant;
  category_code: string;
  station: string | null;
  stock_actual: number;
  cost_unitari: number | null;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  tenant_id: Tenant;
  family: string | null;
  bom_active: boolean;
  sold_on_web: boolean;
}

export interface InvoiceOut {
  id: number;
  invoice_number: string;
  invoice_date: string;
  client: string;
  base_amount: number;
  vat_pct: number;
  vat_amount: number;
  total_amount: number;
  due_date: string | null;
  paid_date: string | null;
  status: "pending" | "paid" | "overdue" | "partial";
  notes: string | null;
}

export interface InvoiceIn {
  id: number;
  invoice_number: string;
  invoice_date: string;
  supplier: string;
  category: string;
  base_amount: number;
  vat_pct: number;
  vat_amount: number;
  total_amount: number;
  due_date: string | null;
  paid_date: string | null;
  status: "pending" | "paid" | "overdue" | "partial";
  notes: string | null;
}

export interface Color {
  id: number;
  tenant_id: Tenant;
  code: string;
  name: string;
  l_suffix: string | null;
  is_active: boolean;
}

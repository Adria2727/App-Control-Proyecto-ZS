// Tipus de dades de ZeroStock (reflecteixen les taules de Supabase)

export type Tenant = "BUMBBA" | "SUNBBA";

export interface Component {
  id: number;
  sku: string;
  name: string;
  tenant_id: Tenant;
  category_code: string;
  color_code: string | null;
  station: string | null;
  stock_actual: number;
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

export interface Color {
  id: number;
  tenant_id: Tenant;
  code: string;
  name: string;
  l_suffix: string | null;
  is_active: boolean;
}

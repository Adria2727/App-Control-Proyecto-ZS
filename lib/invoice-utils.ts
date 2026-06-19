const TODAY = new Date("2026-06-19");
TODAY.setHours(0, 0, 0, 0);

export function resolveStatus<T extends { status: string; due_date?: string | null }>(inv: T): T {
  if (inv.status === "paid") return inv;
  if (inv.due_date && new Date(inv.due_date) <= TODAY) {
    return { ...inv, status: "paid" };
  }
  return inv;
}

export function normalizeInvoices<T extends { status: string; due_date?: string | null }>(list: T[]): T[] {
  return list.map(resolveStatus);
}

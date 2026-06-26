-- Factura de venda N26-2 a Nubba Spaces (22/06/2026)
INSERT INTO invoices_out (invoice_number, invoice_date, client, base_amount, vat_pct, vat_amount, total_amount, due_date, status, notes)
VALUES (
  'N26-2',
  '2026-06-22',
  'Nubba Spaces, S.L.',
  16743.70,
  21,
  3516.18,
  20259.88,
  '2026-06-23',
  'pending',
  'Enviaments Bumbba'
)
ON CONFLICT (invoice_number) DO NOTHING;

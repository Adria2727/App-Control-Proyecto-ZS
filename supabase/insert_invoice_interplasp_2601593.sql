-- Factura Interplasp 2601593 (12/06/2026)
INSERT INTO invoices_in (invoice_number, invoice_date, supplier, category, base_amount, vat_pct, vat_amount, total_amount, due_date, status, notes)
VALUES (
  '2601593',
  '2026-06-12',
  'Interplasp S.L.',
  'rellens',
  19066.86,
  21,
  4004.04,
  23070.90,
  '2026-07-13',
  'pending',
  'Albara 2601649 - Matalassos 190 Bumbba, Nuclis Pouf Bumbba, Matalassos 190 Sunbba'
)
ON CONFLICT (invoice_number, supplier) DO NOTHING;

-- Factura Interplasp 2601808 (22/06/2026)
INSERT INTO invoices_in (invoice_number, invoice_date, supplier, category, base_amount, vat_pct, vat_amount, total_amount, due_date, status, notes)
VALUES (
  '2601808',
  '2026-06-22',
  'Interplasp S.L.',
  'rellens',
  3702.07,
  21,
  777.43,
  4479.50,
  '2026-07-23',
  'pending',
  'Albara 2601872 - Nuclis Pouf Bumbba/Sunbba, Matalassos 160 Sunbba, Bracos Sunbba'
)
ON CONFLICT (invoice_number, supplier) DO NOTHING;

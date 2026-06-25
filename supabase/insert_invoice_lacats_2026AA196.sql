-- Factura Lacats VF 2026-AA.196 (05/05/2026)
INSERT INTO invoices_in (invoice_number, invoice_date, supplier, category, base_amount, vat_pct, vat_amount, total_amount, due_date, status, notes)
VALUES (
  '2026-AA.196',
  '2026-05-05',
  'Lacats VF S.L.',
  'potes',
  8650.40,
  21,
  1816.58,
  10466.98,
  '2026-06-19',
  'pending',
  'Albara 1.1516 - Potes grans/petites pintura RAL 1013/7016/6013/7012/7035 + 2 viatges'
)
ON CONFLICT (invoice_number, supplier) DO NOTHING;

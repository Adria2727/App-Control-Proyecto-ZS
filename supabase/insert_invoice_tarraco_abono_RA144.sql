-- Abono Tarraco Confort 2026-RA144 (08/05/2026)
-- Import negatiu: es un abono (nota de credit)
INSERT INTO invoices_in (invoice_number, invoice_date, supplier, category, base_amount, vat_pct, vat_amount, total_amount, due_date, status, notes)
VALUES (
  '2026-RA144',
  '2026-05-08',
  'Tarraco Confort Upholstery S.L.',
  'fundes',
  -14079.01,
  21,
  -2956.59,
  -17035.60,
  '2026-05-08',
  'paid',
  'ABONO - Fundes textils i coixins + transport importacio'
)
ON CONFLICT (invoice_number, supplier) DO NOTHING;

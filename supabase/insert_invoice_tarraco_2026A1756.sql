-- Factura Tarraco Confort 2026-A/1756 (18/06/2026)
INSERT INTO invoices_in (invoice_number, invoice_date, supplier, category, base_amount, vat_pct, vat_amount, total_amount, due_date, status, notes)
VALUES (
  '2026-A/1756',
  '2026-06-18',
  'Tarraco Confort Upholstery S.L.',
  'fundes',
  11140.00,
  21,
  2339.40,
  13479.40,
  '2026-06-18',
  'pending',
  'Coixins Bummba (farcits + fundes textils pana), tela pana 3 colors, transport + embalatge'
)
ON CONFLICT (invoice_number, supplier) DO NOTHING;

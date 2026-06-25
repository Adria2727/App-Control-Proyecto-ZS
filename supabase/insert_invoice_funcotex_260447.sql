-- Factura Funcotex 260447 (16/04/2026)
INSERT INTO invoices_in (invoice_number, invoice_date, supplier, category, base_amount, vat_pct, vat_amount, total_amount, due_date, status, notes)
VALUES (
  '260447',
  '2026-04-16',
  'Funcotex SLU',
  'fundes',
  1644.00,
  21,
  345.24,
  1989.24,
  '2026-06-15',
  'paid',
  'Albara 260514 - Fundes matalàs Bumbba 190/160/80 (Verde/Gris/Pedra)'
)
ON CONFLICT (invoice_number, supplier) DO NOTHING;

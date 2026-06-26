-- 3 factures de venda a Nubba Spaces S.L.
INSERT INTO invoices_out (invoice_number, invoice_date, client, base_amount, vat_pct, vat_amount, total_amount, due_date, status, notes)
VALUES
  ('V10703-310326', '2026-03-31', 'Nubba Spaces, S.L.', 1760.33, 21, 369.67, 2131.00, '2026-03-31', 'pending', 'Fat. V10703'),
  ('V10703-150626', '2026-06-15', 'Nubba Spaces, S.L.', 4557.85, 21, 957.15, 5514.00, '2026-06-15', 'pending', 'Fat. V10703'),
  ('V10703-230626', '2026-06-23', 'Nubba Spaces, S.L.', 2727.41, 21, 572.76, 3299.17, '2026-06-23', 'pending', 'Fat. V10703')
ON CONFLICT (invoice_number) DO NOTHING;

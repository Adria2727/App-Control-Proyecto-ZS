-- 3 factures de venda a Nubba Spaces S.L. (imports corrects: base + IVA 21%)
INSERT INTO invoices_out (invoice_number, invoice_date, client, base_amount, vat_pct, vat_amount, total_amount, due_date, status, notes)
VALUES
  ('V10703-310326', '2026-03-31', 'Nubba Spaces, S.L.', 2131.00, 21, 447.51,  2578.51, '2026-03-31', 'pending', 'Fat. V10703'),
  ('V10703-150626', '2026-06-15', 'Nubba Spaces, S.L.', 5514.00, 21, 1157.94, 6671.94, '2026-06-15', 'pending', 'Fat. V10703'),
  ('V10703-230626', '2026-06-23', 'Nubba Spaces, S.L.', 3299.17, 21, 692.83,  3992.00, '2026-06-23', 'pending', 'Fat. V10703')
ON CONFLICT (invoice_number) DO UPDATE SET
  base_amount  = EXCLUDED.base_amount,
  vat_amount   = EXCLUDED.vat_amount,
  total_amount = EXCLUDED.total_amount;

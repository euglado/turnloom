# Contributing / Katkı

Open an issue describing the problem without private tokens, IDs or logs. For a pull request,
explain the changed behavior and run `npm ci --ignore-scripts`, `npm run check`, and
`npm audit --audit-level=low` in a clean checkout without `.env`.

Keep the Guilds-only intent, channel/permission checks, owner-bound drafts, mention suppression,
and retry-safe updates. Add a focused regression test when fixing a queue or permission bug.
Do not add telemetry or persistence without an explicit design and privacy discussion.
Source is MIT; dependencies retain their licenses. If changing dependencies, review their
licenses and run `node scripts/check-supply.mjs --write` to refresh the inventory.

Sorunu token, gerçek kullanıcı kimliği veya hassas log paylaşmadan issue olarak açıklayın.
PR'da davranış değişikliğini ve yukarıdaki kontrollerin sonuçlarını belirtin. En az yetki,
özel önizleme ve güvenli hata davranışını koruyun. Bağımlılık değişince lisansları inceleyin
ve yukarıdaki komutla envanteri yenileyin.

# Admin Tools
- `serviceAccount.json` (NIET committen) — download uit Firebase (Service accounts)
- `set-claim.js` — geef jezelf `admin: true`
  ```bash
  ADMIN_EMAIL=jij@example.com node tools/set-claim.js
  ```
- `seed-firestore.js` — seed data uit `data/*.json` naar Firestore
  ```bash
  node tools/seed-firestore.js
  ```

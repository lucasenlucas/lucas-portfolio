# Portfolio Site (read-only)

Publieke portfolio die leest uit Firestore (of JSON fallback).

## Install
- Zet je Firebase config in `js/config.js` (kopieer van `js/config.example.js`).
- Firestore rules: public read / admin-only write (zie admin repo).

## Develop
- Start lokale server: `npx serve` of `python3 -m http.server 5173`
- Open `http://localhost:5173`

## Deploy
- GitHub Pages / Netlify / Vercel. Vergeet je domein niet toe te voegen bij Firebase Auth -> Authorized domains.

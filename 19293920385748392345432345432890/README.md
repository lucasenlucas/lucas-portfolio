# Portfolio Admin (panel)

Beheer **Home/About (Markdown)**, **Projecten**, **Blog**, **Onderzoeken** met Firebase Auth + Firestore.

## Setup
1) Firebase project → Firestore (Native) + Auth (Email/Password).
2) Plaats je web-config in `js/config.js` (kopie van `js/config.example.js`).
3) Zet `firestore.rules` in Firebase.
4) Geef jezelf admin-claim (zie `tools/set-claim.js`).

## Develop
- Lokaal serveren: `npx serve` of `python3 -m http.server 5173`
- Open `http://localhost:5173/lucas.html`

## Deploy
- Aanrader: Netlify/Vercel op subdomein (bijv. `admin.jouwdomein.nl`).
- Voeg subdomein toe bij Firebase Auth → Authorized domains.
- (Optioneel) Extra bescherming met Netlify Password/Cloudflare Access.

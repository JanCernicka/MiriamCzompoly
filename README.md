# Miriam Czompoly — Interiérový dizajn Trnava

Premium, conversion-focused marketing website for interior designer Miriam Czompoly.
Static, self-contained, and ready to deploy to any static host (Cloudflare Pages, GitHub
Pages, Netlify, …).

## Pages
| File | Route | Purpose |
|------|-------|---------|
| `index.html` | `/` | Domov — hero, problém, kvalifikácia, služby (4 cenové balíky), garancie, proces, realizácie (case-study modaly), recenzie, o mne, lead-magnet, FAQ, záverečné CTA |
| `diagnostika.html` | `/diagnostika` | Predajná stránka platenej diagnostiky (249 €) |
| `5-chyb.html` | `/5-chyb` | Opt-in na lead magnet + „ďakujem“ stav |

## Structure
```
index.html · diagnostika.html · 5-chyb.html
assets/
  css/style.css      – celý dizajnový systém
  js/main.js         – sticky header, mobilné menu, FAQ akordeón, modaly, validácia formulárov, scroll reveal
  img/favicon.svg    – favicon (placeholder monogram)
  img/og-cover.svg   – Open Graph náhľad (placeholder)
```

## Tech
- Clean semantic HTML, mobile-first, fully responsive.
- No build step. Vanilla JS, no frameworks. Google Fonts (Cormorant Garamond + Inter) with system fallbacks.
- Accessible: skip link, focus states, ARIA on nav/modals/accordion, alt/labels.
- Slovak (`lang="sk"`), diacritics preserved.

## Placeholders to fill (`[B]`)
Photos (hero, portrét, pred/po v case studies), menné recenzie + súhlasy, chýbajúce krstné
mená a citáty v kartách „Miestnosť“ a „Na kľúč“. Kontaktný telefón/e-mail v pätičke a
závere (nahradia GHL merge fields). Rezervačný kalendár na `/diagnostika` a opt-in/kalendár
workflow.

## Local preview
```
python3 -m http.server 8099   # potom otvor http://localhost:8099
```

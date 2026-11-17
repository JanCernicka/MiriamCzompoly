# Miriam Czompoly — kompletný marketingový systém

Repo obsahuje **všetko konkrétne pre klientku Miriam Czompoly** (interiérová dizajnérka, Trnava).
Znovupoužiteľné princípy a nástroje pre GoHighLevel žijú v samostatnom repe **GHLtool**.

## Čo je kde

| cesta | obsah |
|--|--|
| `index.html` · `diagnostika.html` · `5-chyb.html` · `assets/` · `robots.txt` | **živý web** (nasadený na Cloudflare Pages, s napojeným GHL kalendárom, formulárom a Meta Pixelom) |
| `sprava-realizacii.html` · `functions/api/realizacie.js` · `functions/_lib/realizacie.js` · `functions/index.js` | **správca realizácií pre Miriam** (17. 11. 2026): www.miriamczompoly.sk/sprava-realizacii, heslo ako do konzoly (secret `SPRAVA_HESLO`). Poradie, skrytie, úvodná fotka dlaždice, poradie fotiek v okne, nové realizácie s fotkami a fotky k existujúcim (`functions/api/realizacie-foto.js`, fotky v D1 `realizacie_fotky`, podáva ich `functions/foto-realizacie/[subor].js`). Návod pre Miriam: `navod/sprava-realizacii.pdf`. Ukladá do D1 (`realizacie_nastavenie`, každé uloženie je nová verzia), `functions/index.js` podľa toho skladá galériu pri každom zobrazení úvodnej stránky. Statický `index.html` je pôvodná podoba a núdzová záloha. 🔴 Nová realizácia v kóde sa v galérii objaví na konci, kým ju Miriam nepresunie. |
| `ghl/00-master-brief.md` | zadanie a priebežný log celej zákazky |
| `ghl/reports/` | všetky analýzy, plány a záznamy o tom, čo bolo nasadené naživo |
| `ghl/ebook/` | lead magnet „5 najdrahších chýb…" + skript, ktorý ho generuje |
| `ghl/data/` | exporty z GHL (pipeline, kontakty, workflowy, custom values) |
| `ghl/materials/` | pôvodné podklady od klientky (návrhy, kalkulácie, popis práce) |

## Živé prostredie

| vec | hodnota |
|--|--|
| GHL sub-account | `o86atLjsdR9IoUTWgYna` |
| Meta ad account | `1210955550121224` |
| Web (staging) | https://miriam-web-staging.pages.dev |
| Cieľová doména | `miriamczompoly.sk` (DNS cutover ešte neprebehol) |

## Aktuálny stav

- **8 workflowov** postavených v GHL, všetky **draft** — čakajú na odsúhlasenie cien klientkou
- **Meta kampaň** postavená, všetko **PAUSED**
- **Web** beží na staging URL s `noindex`

Podrobnosti a zoznam otvorených úloh: `ghl/reports/AUDIT-golive-readiness.md` a `ghl/reports/FIXES-applied.md`.

## Web: ako nasadiť
```bash
npx wrangler pages deploy . --project-name=miriam-web-staging --branch=main
```
`--branch=main` je povinný, inak vznikne len preview deployment.

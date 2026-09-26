# A/B test stránky diagnostiky a meranie lievika

Postavené 26. 9. 2026 podľa GHLtool `lievik/` (vetva `claude/setup-novy-klient-yafrsr`,
súbory 01 až 06), kód prevzatý z bežiaceho lievika DKP.

## Stav

| Čo | Stav |
|---|---|
| Meranie na `/diagnostika` a `/dakujem` | 🟢 **naostro od 26. 9. 2026 15:28** (13:28:38 UTC) |
| A/B delenie 50/50 | ⚪ **vypnuté**, všetci z reklamy vidia A. Zapína sa premennou `AB_ZAPNUTE=1` |
| Varianta B | 🟡 hotová, dá sa pozrieť cez `?ab=b`. Kalendár ukazuje telefón, kým chýba PIT |
| Karta Lievik v konzole | 🔴 **nenasadená**, chýba zdroj workera konzoly, viď nižšie |

## Adresy

| | |
|---|---|
| reklama mieri na | `https://www.miriamczompoly.sk/diagnostika` (nemení sa) |
| varianta A | tá istá stránka ako doteraz, `diagnostika.html` |
| varianta B, náhľad | `https://www.miriamczompoly.sk/diagnostika?ab=b` (nastaví cookie `mc_ab=b` na 30 dní, späť `?ab=a`) |
| projekt B | `miriam-diagnostika-b` (priamy prístup presmeruje na spoločnú adresu s `?ab=b`) |
| zberač | `https://miriam-lievik.pages.dev` (`/e`, `/prehlad` za heslom) |
| D1 | `miriam-lievik` (`3c5a6ea9-b2f0-46b5-ae7a-2b6061882ed9`), viazaná ako `DB` na zberač aj hlavný web |
| stav nastavení | `https://www.miriamczompoly.sk/api/stav` |

Kód: `functions/` (rozdeľovač, meranie, API), `diagnostika-b/` (varianta B), `meranie/`
(zberač, schéma), `konzola/` (karta Lievik, nenasadená). Nasadenie webu: `./nasad-web.sh`
(vynechá konzola, meranie, diagnostika-b). Varianta B: `wrangler pages deploy diagnostika-b/dist --project-name=miriam-diagnostika-b --branch=main`.

## Varianta B

Štruktúra podľa `lievik/01_STRUKTURA.md`: pruh s najbližším voľným termínom, nadpis,
podnadpis, video 16:9, veta pod videom, CTA, 6 recenzií (kopa kariet), čo dostaneš,
kalendár priamo v stránke, pás 32 fotiek, záver, päta. Jeden text CTA na celej stránke.

- Video je to isté ako na A („Diagnostika 20 - hook 5 - rýchly“), prerobené na 16:9
  s rozmazanými bokmi (9:16 by zožralo ohyb). GHL médiá: `.../d6374045-4212-4398-b3c5-d116e98621f0.mp4`, 206 overené.
- Recenzie doslovne z webu so štítkom „Recenzia klienta“, nie „na Googli“ (neoverené).
- Kalendár číta ten istý GHL kalendár ako A, kapacita je spoločná. Formulár: meno,
  e-mail, telefón, ulica, mesto, súhlas. Adresa navyše oproti návodu, lebo WF3 ju
  posiela Miriam aj zákazníčke 2 h pred termínom.
- Po rezervácii ide na `/dakujem`, tú istú ako A. WF3 pošle to isté potvrdenie.
  Navyše značka `diagnostika-lp-b` a príležitosť „meno · telefón“ za 249 €.
- Písmo Cormorant a Inter ako na A, nie systémové z návodu: testuje sa štruktúra, nie značka.

Namerané lokálne (návod: ostrá doména v našom prostredí cez prehliadač nejde), spodok CTA:
iPhone SE 608/667, iPhone 12 556/844, Android 600/800, iPad 687/1024, **notebook 687/768**,
desktop 687/1080. Nič nepreteká do strany. Cookie lišta je na B na tom istom mieste ako na A.

## Meranie

Kroky (musia sedieť na 4 miestach: stránka, `functions/_lib/lievik.js`, zberač, `LIEVIK_POPIS` v konzole):
`pristal`, `scroll-50`, `scroll-90`, `klik-cta`, `kalendar-videl`, `termin-rezervovany` (príchod na `/dakujem`), `odisiel`.

- Meranie vstrekuje rozdeľovač do `<head>` OBOCH variant, rovnaké. UTM sa držia celú session.
- `klik-cta` rata len `a.btn` a `[data-cta]`. Tlačidlá cookie lišty majú tiež triedu `btn`, sú to `<button>`.
- Pixel: varianta ide ako vlastnosť `{ab}` pri PageView aj Lead, nie ako iná udalosť (`consent.js`).
- Overené: lokálne preklikaný celý tok A aj B, všetky kroky v D1 so správnou variantou
  a s kreatívou aj na `/dakujem`. Delenie na náhľade 25 ku 15 zo 40, robot vždy A bez cookie.

## Čo treba, aby test mohol bežať

1. **PIT do projektu `miriam-web-staging`** ako secret `GHL_API_KEY` + `GHL_LOCATION_ID`,
   inak B nerezervuje. Potom jedna skúšobná rezervácia na testovací kontakt.
2. **Zapnúť delenie**: `AB_ZAPNUTE=1` v produkcii a nové nasadenie. Čas zapnutia zapísať do
   `VERZIE` konzoly ako riadok s `ab: true`.
3. **Zdroj konzoly**: živá konzola (`konzola-miriamczompoly`) má 258 riadkov úprav oproti
   šablóne Prezentacia a nie je v žiadnom repe. Bez zdroja workera sa karta nedá nasadiť
   bez rizika. Keď sa nájde: `konzola/worker-doplnok.js` + `konzola/index.html`, secret `STAT_HESLO`.

Počas testu nemeniť URL v reklame, optimalizačnú udalosť, rozpočet o viac ako 20 % ani text
stránok. Víťaz až Fisherovým testom (`lievik/03_AB_TEST.md`), pri 15 €/deň to potrvá týždne.

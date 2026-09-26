# A/B test stránky diagnostiky a meranie lievika

Postavené 26. 9. 2026 podľa GHLtool `lievik/` (vetva `claude/setup-novy-klient-yafrsr`,
súbory 01 až 06), kód prevzatý z bežiaceho lievika DKP.

## Stav

| Čo | Stav |
|---|---|
| Meranie na `/diagnostika` a `/dakujem` | 🟢 **naostro od 26. 9. 2026 15:28** (13:28:38 UTC) |
| Varianta B | 🟢 **funkčná naostro** cez `?ab=b`: skutočné termíny, rezervácia do GHL (overené 26. 9.) |
| A/B delenie 50/50 | 🟢 **zapnuté 26. 9. 2026 16:29** (nasadené 14:29:39 UTC), test sa ráta **od 16:30** (14:30 UTC) |
| Karta Lievik v konzole | 🟢 **nasadená 26. 9.**, konzola má odteraz zdroj v `konzola/` |

## Ostrý test rezervácie z B (26. 9. 2026, 15:52)

Cez náhľad s `TEST_REZIM=ghl-bez-sprav` (zapisuje do GHL, termín bez notifikácií
kalendára), testovací kontakt vyradený z WF3 v tej istej sekunde, WF3 má na začiatku
2 minúty čakania. Prečítané späť z GHL:

- kontakt: meno, e-mail, telefón, adresa (address1, city), značka `diagnostika-lp-b`, zdroj „Diagnostika, stránka B“
- termín „Interiérová diagnostika“ v kalendári `fUjAzOhv2VyiY3XTguPz`, confirmed, Miriam, s adresou
- príležitosť „TEST Claude AB · +421900111222“, 249 €, fáza „Diagnostika rezervovaná“
- 5 h blokovanie funguje aj pri rezervácii z B
- po 2 minútach: bez značky `diagnostika-rezervovana`, v konverzácii len systémové záznamy, **žiadna správa neodišla**
- všetko zmazané, termín znova voľný

Workflow: pri rezervácii sa spúšťa jediný WF3 (trigger termín v kalendári diagnostiky,
stav confirmed). Formulár GHL žiadny workflow nespúšťa. B zakladá termín v tom istom
kalendári, takže spúšťa ten istý WF3 ako A. Že termín z API WF3 spustí, overené 25. 9.
na Janovom kontakte so všetkými správami.

Rozdiel oproti A: B navyše zakladá príležitosť (A ju nezakladá, žiadny workflow to nerobí)
a značku `diagnostika-lp-b`.

## Konzola

Živá konzola bola šablóna Prezentacia (zmena 24. 8., nasadená 26. 8.) + úpravy ovládania
vo frontende. Worker sa nemenil: všetky polia, ktoré frontend číta, šablónový worker vracia.
Nasadené 26. 9. ako: worker zo šablóny + `/api/lievik` a `/api/ab` (v zozname CESTY, za
heslom konzoly) + živý frontend s kartou Lievik. Zdroj `konzola/dist/`, nasadenie
`konzola/nasad.sh`. Predošlé nasadenie na návrat: `72610073-66ed-4589-b4cb-42486830c3ec`.

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
(zberač, schéma), `konzola/` (zdroj konzoly aj s kartou Lievik). Nasadenie webu: `./nasad-web.sh`
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

## Zapnutie delenia (26. 9. 2026)

- `AB_ZAPNUTE=1` v produkcii projektu `miriam-web-staging`, prečítané späť, nové nasadenie 14:29:39 UTC.
- Overené naostro: `/api/stav` hlási `abZapnute: true`; 40 návštev z iPhonu 19 A ku 21 B, každá s cookie
  `mc_ab`; Googlebot aj facebookexternalhit vždy A bez cookie; B číta ostré termíny z GHL.
- Konzola: riadok `diagnostika-ab` s `ab: true` a `od` 14:30 UTC vo `VERZIE`, v prepínači predvolený. Nasadené.
- Janovo prezeranie z 26. 9. je pred 14:30 UTC, do testu sa nezapočíta.
- Vypnúť: `AB_ZAPNUTE` zmazať alebo dať na `0` a znova `./nasad-web.sh`. Kto už má cookie, ostáva na svojej variante 30 dní.

Počas testu nemeniť URL v reklame, optimalizačnú udalosť, rozpočet o viac ako 20 % ani text
stránok. Víťaz až Fisherovým testom (`lievik/03_AB_TEST.md`), pri 15 €/deň to potrvá týždne.

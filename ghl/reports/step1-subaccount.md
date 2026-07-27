# KROK 1 — Analýza GHL subúčtu (Miriam Czompoly)

_Stav ku dňu 2026-07-23. Zdroj: živý GHL subúčet `o86atLjsdR9IoUTWgYna`. Surové dáta v `client-miriam/data/`._

## 1. Kto to je / základ
- **Miriam Czompoly** — interiérová dizajnérka, Trnava (SK). Sólo podnikateľ.
- E-mail: dizajn@miriamczompoly.sk · Tel: +421 918 819 906 · Web: miriamczompoly.sk
- FB: /interiermiriamczompoly · Google profil napojený (recenzie).
- GHL subúčet vytvorený **2025-08-06** (systém beží ~11 mesiacov).
- Timezone nastavená na **Europe/Amsterdam** (chyba — má byť Bratislava; ovplyvňuje časovanie SMS/e-mailov a rezervácií).

## 2. Objem a zdroje leadov (jadro problému)
- **Iba 84 kontaktov spolu** za obdobie ~2026-02 až 2026-07 → **~15 leadov/mesiac**. Veľmi nízky objem.
- Zdroje: **Instagram 49/84 (58 %)**, calendar 19, facebook 3, paid social 1, formulár/chat 2. → biznis stojí na **organickom IG**, platené reklamy generujú takmer nič v CRM.
- Konverzácie sú prakticky všetko **Instagram DM** — neformálny, emoji tón, ručné dopisovanie. Predaj beží manuálne cez DM, nie systémom.

## 3. Ponuka / rebrík hodnoty (súčasný stav)
1. **Lead magnet:** E-book (formulár + pole „O aký e-book máte záujem"), formulár „15 min konzultácia", súťaž („60 min konzultácia v hodnote 120 € zadarmo").
2. **Bezplatná konzultácia** — 2 kalendáre („Bezplatná konzultácia s interiérovou dizajnérkou" / „…s Miriam Czompoly").
3. **Platená konzultácia 190 €** (stage „Zaplatil 190€ konzultáciu" → „190€ konzultácia dokončená").
4. **Prerábka interiéru** (stage „Začala prerábka interiéru") — plný dizajnérsky projekt.
5. **Recenzia** (Google review funnel + 3 workflowy).

### ⚠ Cenový problém — tvrdé čísla z CRM
Zaznamenané hodnoty projektov v pipeline:
| Klient | Stage | Hodnota |
|---|---|---|
| Lenka Valentínová | Začala prerábka | **1 785 €** |
| Dimová | Začala prerábka | **435 €** |
| Robert Ďuriš | 190 € konzultácia dokončená | 290 € |
| Lucia Potúčková | 190 € konzultácia dokončená | 190 € |
| Gabriela Demcakova / Antonia Paldanova | Zaplatil 190 € | 190 € |

- **Kompletné interiérové projekty fakturované za 435–1785 €.** To je dramaticky málo za rozsah (návrhy majú 88–131 strán — viď materiály Valentínová/Dimová).
- Ešte aj bezplatné plnenie sa „predáva" ako hodnota 120 € (súťaž) → devalvuje vlastnú prácu.
- Paid konzultácia 190 € je jediný skutočný spätný filter — nízka kotva.

## 4. Pipeline & CRM hygiena
- 2 pipeliny: **„Hlavný predajný proces"** (9 stage-ov, celý postavený okolo konzultácie) + **„Paid Ads"** (generický Lead In/Responded, nevyužitý).
- **21 príležitostí spolu, VŠETKY „open"** — nič neoznačené won/lost. Nedá sa merať konverzia ani obrat.
- Rozloženie: 12× „Rezervoval bezplatnú konzultáciu", 3× „Potvrdil", 2× „Zaplatil 190 €", 2× „190 € dokončená", 2× „Začala prerábka". → **leady hnijú hneď na začiatku lievika** (rezervoval, ale ďalej sa nehýbe).
- Väčšina opp má `monetaryValue = 0` → hodnota sa needituje, reporting je slepý.

## 5. Workflowy (12) — čo beží
**Publikované:** 1–3 Recenzie (vypýtanie / klik na link / negatívna recenzia), Ebook Delivery Slovak, Pred konzultáciou, Po konzultácii, Pripomienka termínu (2h/10min), Reaktivácia starých kontaktov, WebStránka – potvrdenie telefonickej konzultácie.
**Draft (nebeží):** Facebook Pixel CAPI, Reaktivácia databázy, WebStránka – odoslaný formulár bez rezervácie termínu.
- Ťažisko = **prevádzka + recenzie + pripomienky**. Chýba skutočný **nurture/predajný** sekvenčný systém (edukácia hodnoty, budovanie autority, follow-up na nerozhodnutých, no-show recovery, upsell po projekte).
- Kľúčové „záchytné" workflowy sú v **drafte** (formulár bez rezervácie = stratené leady; CAPI = slepé meranie reklám).

## 6. Formuláre, kalendáre, polia, tagy
- **Formuláre (3):** E-book, 15 min konzultácia, Form 1.
- **Kalendáre (2):** obe „Bezplatná konzultácia" (duplicita — mätúce, treba zjednotiť).
- **Custom fields (11):** e-book záujem, typ nábytku, rozsah projektu, „Are you the home owner?", timeline projektu, + recenzné hodnotenia. Dobrý základ na kvalifikáciu, ale nevyužitý na segmentáciu/cenotvorbu.
- **Tagy (19):** fb lead/lf/lp, lead responded, scheduled, website form, review-*, reaktivácia… — prevádzkové, nie hodnotové/segmentačné.
- **Custom values:** Funnel link, review linky, kontest 120 €.

## 7. Závery Kroku 1 (vstup pre Krok 6)
1. **Podcenená ponuka** je potvrdená dátami: plné projekty za 435–1785 €, kotva 190 €, freebies v hodnote „120 €".
2. **Nízky objem leadov (~15/mes)** a všetko na organickom IG → drahý a krehký prílev.
3. **Lievik uviazne hneď po rezervácii** konzultácie; žiadne systematické dotiahnutie.
4. **Chýba nurture/autority/predajný obsah** — systém je len prevádzkový (pripomienky + recenzie).
5. **Slepé meranie** (CAPI draft, opp bez hodnôt, nič won/lost) → nevie sa vyhodnotiť cena za lead / za klienta.
6. **Rozbité záchytné body** v drafte (formulár bez rezervácie, reaktivácia DB).

### Otvorené (do ďalších krokov)
- Krok 2: web miriamczompoly.sk (ponuka, cena, pozicionovanie, CTA).
- Krok 3: Meta reklamy + metriky (CPL, CPC, real spend vs. 1 paid lead v CRM).
- Krok 4: materiály ponuky (Valentínová, Dimová, kalkulácie, obsah práce) — čo presne a za koľko dodáva.
- **Krok 5: 2 knihy zatiaľ NEDORUČENÉ — treba poslať.**

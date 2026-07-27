# KROK 3 — Analýza Meta reklám a metrík

_Stav 2026-07-23. Zdroj: Facebook Ads MCP, účet `1210955550121224` („Miriam Czompoly", EUR). Surové čísla: `data/meta-ads-summary.md`._

## 1. Ekonomika lievika (tvrdé čísla)
- **Lifetime spend ≈ €1 037** (+ júl), reálne behá od nov 2024, systematicky od feb 2026.
- Aktuálne 2 kampane (feb–júl 2026): **€727.92 → ~11 rezervovaných konzultácií + ~5 leadov** → blended **≈ €66 za rezervovanú konzultáciu** (drahé za *bezplatný* hovor).
- Napojenie na CRM (Krok 1): z toho reálne **2× „Zaplatil 190 €"** a **2× „Začala prerábka"** (Valentínová €1 785, Dimová €435).
- **Cena za zavretého klienta len z reklamy ≈ €364** (727.92 / 2). Na projekte Dimová (€435) samotné reklamné náklady zožerú **84 % tržby** — a to bez jej času, materiálov, GHL a našej odmeny. → **štrukturálna strata / break-even.** Presne to, čo Jan opísal: vysoká cena za lead aj za klienta, nízka marža.

## 2. Čo funguje (ponechať a stavať na tom)
- **Vrch lievika NIE je problém.** Kliky sú extrémne lacné (CPC €0.03–0.29), CTR vysoké (4–13 %), CPM €2.5–13. Hooky a kreatívy fungujú (video reklama 11–13 % CTR).
- **Reklamná copy je slušná** — pain-led, presný avatar (ženy, Trnava a okolie, „investovali, ale necítia sa doma"), zoznam chýb (zlé rozloženie, nábytok pri stenách, miestnosť bez centra), testimonial (Iveta Pappová), scarcity („kým sa nenaplnia 4 miesta"). → dobrý základ pre nové reklamy na reframovanú ponuku.

## 3. 🔴 Kde peniaze unikajú
1. **Ponuka v reklame = „konzultácia zadarmo" / „bezplatný 15-min hovor".** Všetky aktívne kreatívy tlačia FREE vstup. Free = priťahuje low-intent, nízka účasť, nízke zatvorenie, žiadne kotvenie ceny. Platená kampaň „90 min 190 €" bola **opustená** (€10.53, 1 lead) — namiesto zdvihnutia hodnoty ustúpila k rozdávaniu zadarmo.
2. **Rozbité meranie.** Na úrovni kampaní/účtu je „results = Not available" (zmiešané attribution okná); `onsite_conversion_lead_grouped` väčšinou nedostupné; **FB Pixel CAPI workflow je v drafte** (Krok 1). → Optimalizuje sa naslepo, Meta nedostáva čistý konverzný signál. LPV padli z 2 769 (feb) na <260 (apr–jún) pri **rastúcom** spende → efektivita klesá s mierkou.
3. **Podcenená ponuka downstream** (Krok 1/2) → aj zavretý klient nezaplatí späť CAC + čas.
4. **Nedbalý setup:** CTA tlačidlo `BOOK_TRAVEL` (nesprávne), chaotické názvy („Free konz last try pls work"), duplicitné/opustené kampane a ad-sety, dva rôzne prvé kroky (15-min vs 90-min/190 €).

## 4. Diagnóza (spojenie Krokov 1–3)
Nie je to problém dosahu ani ceny kliku. Reťaz je:
**lacný klik → FREE nízko-intentný lead (~€66/rezervácia) → slabá kvalifikácia a konverzia → podcenený projekt (€435–1 785) → CAC (~€364) ≈ tržba.**
Rozbité meranie znemožňuje škálovať a zdražovanie ponuky sa nikdy nepremietlo do reklamy.

## 5. Smer riešení (vstup pre Krok 6 — spresní sa po knihách)
- **Reframovať ponuku v reklame** z „free call" na hodnotovo ukotvený vstup (platený „paid discovery"/diagnostika s garanciou, alebo aspoň silná kvalifikácia pred kalendárom) — filtruje kupujúcich, dvíha intent aj cenu (Hormozi: offer + risk reversal).
- **Opraviť meranie ako prvé:** spustiť/овeriť Pixel + CAPI (aktivovať draft workflow), zjednotiť attribution, čisté konverzné eventy (rezervácia, platba 190 €, projekt) → až potom škálovať.
- **Zladiť reklamu ↔ web ↔ CRM** na jeden prvý krok a jednu novú ponuku (dnes sú tri rôzne: web „free hovor", CRM „190 €", ads „free 15-min").
- **Zachovať a recyklovať** funkčné hooky/creative a copy angles do nových reklám na novú ponuku.
- **Zvýšiť LTV/cenu** (Krok 6) tak, aby CAC €364 bol malý zlomok hodnoty klienta, nie 84 %.

### Otvorené
- Krok 4: materiály ponuky (Valentínová, Dimová, kalkulácie, obsah práce) — čo presne a za koľko reálne dodáva → podklad pre nové ceny/balíky.
- Krok 5: 2 knihy ($100M Offers, $100M Leads) — rámce pre finálne riešenia.

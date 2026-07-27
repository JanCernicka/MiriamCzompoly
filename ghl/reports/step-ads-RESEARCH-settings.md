# RESEARCH — Ako sa Meta reklamy majú robiť (2026 best practice)

_Toto je **normatívny** dokument: ako to má vyzerať podľa aktuálnej best practice. **Zámerne sa neopiera o jej historické dáta** — tie sú odozvou na starú, zle postavenú ponuku (konzultácia zadarmo, CTA `BOOK_TRAVEL`, rozbité meranie). Optimalizovať nový systém podľa výsledkov starého by znamenalo zabetónovať práve tie chyby, kvôli ktorým robíme reframe._

---

## 0. Najdôležitejšia vec na rovinu: rozpočet

Best practice pre zmysluplné dáta hovorí **$30–50/deň na ad-set**; „praktické minimum" pre lokálny biznis je **$50–100/deň**, s výnimkou, že lokálne služby s vysokou hodnotou konverzie zvládnu **$300–1 000/mesiac**.

**10 €/deň = ~300 €/mesiac = úplný spodný okraj toho, čo vôbec dáva zmysel.**

Čo z toho plynie — bez prikrášľovania:
- Ad-set **s veľkou pravdepodobnosťou neopustí learning phase** (potrebuje ~50 optimalizačných udalostí za 7 dní).
- V learning phase sú náklady o **20–50 % vyššie** než po nej.
- Toto je **pomalý test uhlov**, nie akvizičný motor. Vyhodnocovanie treba počítať v týždňoch, nie dňoch.

> Odporúčanie: ak má klientka ambíciu robiť z toho kanál, cieliť na **30–50 €/deň**. Pri 10 €/deň sa dá zistiť *ktorý uhol funguje*, ale nie *koľko to unesie*.

Jediná vec, ktorá sa pri malom rozpočte robiť **musí**: **nefragmentovať**. 5 ad-setov po 20 $ je horších než 2 po 50 $. → 1 kampaň, 1 ad-set. To je jediná správna štruktúra pri tomto rozpočte.

---

## 1. Prítomnosť v lokalite → **„bývajú tu" (`home`)**

### Ako to Meta má
| voľba | API `location_types` | koho zasiahne |
|--|--|--|
| Bývajú tu | `["home"]` | domáci (podľa domovskej lokality profilu) |
| Bývajú **alebo** tu boli nedávno | `["home","recent"]` | + návštevníci, turisti — **Meta default** |
| Boli tu nedávno | `["recent"]` | len návštevníci |
| Cestujú tu | `["travel_in"]` | ľudia s domovom >200 km ďaleko |

### Prečo `home` — logika ponuky, nie štatistika
Produkt je **90-minútová diagnostika fyzicky u klientky doma**. Nadväzujúce balíky sú 1 090 – 8 000 € zásahy do bytu, ktorý musí človek vlastniť alebo v ňom dlhodobo bývať.

Kto v Trnave len prechádza, nakupuje alebo je na návšteve, **si to nemôže kúpiť ani teoreticky**. Nie je to slabší segment — je to segment s nulovou kúpnou možnosťou. Pri 10 €/deň je každá takáto impresia priama strata.

Default `home,recent` je nastavený pre biznisy, kde návštevník **je** zákazník (kaviareň, hotel, obchod). Pre službu doma u zákazníka je default jednoducho zlý.

### 🔑 Praktický nález (otestované naživo)
Meta v 2026 **v UI zrušila samostatnú voľbu „People living in this location"** — v Ads Manageri ostalo len „living in or recently in". **Cez API to stále funguje.** Otestoval som to priamo na jej ad-sete, Meta prijala a uložila:
```json
"geo_locations": { "location_types": ["home"] }
```
→ Cez API vieme nastaviť to, čo sa v rozhraní naklikať nedá.

⚠️ **Riziko:** ak ad-set niekto otvorí a uloží v Ads Manageri, UI to môže prepísať späť na `home,recent`. Po každej ručnej úprave to treba prekontrolovať.

---

## 2. Advantage+ Audience → **pri štarte VYPNÚŤ**

### Čo je pod A+A tvrdé a čo len návrh
| Tvrdé — Meta dodrží | Len návrh — Meta môže prekročiť |
|--|--|
| Lokalita · Jazyk · **Minimálny** vek · Vylúčenia · Special Ad Category | **Maximálny vek** · **Pohlavie** · Záujmy · Custom publiká · Lookalike |

Pod A+A teda „ženy 30–65" **nie je nastavenie, je to prosba**. Meta môže doručovať mužom aj mimo vekového rozsahu.

**Priamy dôkaz z jej účtu:** keď som skúsil nastaviť `age_min: 35` pri zapnutom A+A, Meta to odmietla s chybou:
> *„With ad sets that use Advantage+ audience, the minimum age audience control can't be set to higher than 25: You can add a higher minimum age as a **suggestion** instead."*

Takže A+A nedovolí ani vekový spodok nad 25.

### Kedy A+A áno / nie (best practice prahy)
| A+A zapnúť keď | A+A vypnúť keď |
|--|--|
| ~50 konverzií/týždeň | menej ako 50 konverzií/týždeň |
| ≥ $30/deň | **< $30/deň** ✔ jej prípad |
| čistý pixel + CAPI | rozbité/chýbajúce meranie ✔ jej prípad |
| široký prospecting | **hyperlokál (malý rádius)** ✔ jej prípad |
| viac kreatív s odlišnými konceptmi | tenké dáta, nový účet/funnel ✔ jej prípad |

**Spĺňa 4 z 5 dôvodov pre vypnutie.** → `advantage_audience: 0` (original audiences).

### Vek a pohlavie — z logiky ponuky
- **Pohlavie: ženy.** Nie je to odhad z dát — celá ponuka a copy je písaná ženám („Si z Trnavy a rozmýšľaš nad prerábkou…"). Cieliť inak by znamenalo platiť za ľudí, ktorým reklama nie je adresovaná.
- **Vek 30–65.** Spodok podľa logiky kupujúceho: musí ovládať priestor (vlastniť/dlhodobo bývať) a mať voľných 249 € na diagnostiku + reálny výhľad na 1 090 – 8 000 €. To pod 30 rokov nie je typické. Horný okraj **nechávam otvorený na 65+** — s vekom rastie pravdepodobnosť vlastného bývania bez hypotéky, čiže voľných peňazí.

> Neužšie než toto ísť netreba. Pri 10 €/deň je väčším rizikom priúzke publikum (drahý CPM) než príliš široké.

### Kedy A+A zapnúť neskôr
Keď (a) beží pixel + CAPI, (b) chodí ~50 lead eventov/týždeň, (c) rozpočet ≥ 30 €/deň. Vtedy A+A typicky prekoná ručné cielenie.

**Medzikrok, ak by ste A+A chceli skôr:** dá sa zamknúť geo a nechať expandovať zvyšok:
```json
"targeting_automation": { "advantage_audience": 1,
  "individual_setting": { "age": 1, "gender": 1, "geo": 0 } }
```
`geo: 0` = publikum sa rozšíri, ale **nikdy mimo servisnú oblasť**. Toto je jediná bezpečná forma A+A pre lokálnu službu.

---

## 3. Umiestnenia → Advantage+ ÁNO, ale až keď máme formáty

### Čo hovorí best practice
Advantage+ Placements dávajú typicky **o 10–20 % lepší cost-per-result** než ručný výber — algoritmus si nájde lacné impresie kdekoľvek. Ručné vylučovanie zmenšuje aukčný priestor a **zdražuje**.

**Ale je tam podmienka:** platí to *„when sufficient creative variety is available"* — teda **1:1 alebo 4:5 pre feed a 9:16 pre Stories/Reels**, každý formát skontrolovaný pre svoju plochu. Ak pustíte A+ placements bez 9:16 assetov, platíte za impresie s automaticky oreznutou, škaredou kreatívou.

### Čo z toho pre ňu
Momentálne existujú len **feed formáty** (video 4:5, carousel štvorce, statika). **9:16 vertikálna kreatíva neexistuje.**

→ Pri štarte: umiestnenia **FB feed + FB Reels + IG feed** (formáty, ktoré máme).
→ **Akonáhle bude 9:16 kreatíva → prepnúť na Advantage+ Placements.** To je cieľový stav, nie výnimka.

_Poznámka k mojej vlastnej predošlej verzii: umiestnenia som najprv zúžil na základe jej starých čísel. To bolo metodicky zlé — staré čísla merajú starú ponuku. Správny dôvod na zúženie je „nemáme 9:16 asset", nie „IG nám minule nešiel"._

---

## 4. Cieľ kampane a optimalizácia

### Objective
**Leads (`OUTCOME_LEADS`)** ✔ správne.

### Optimalizačný cieľ — kľúčové rozhodnutie
Best practice: konverzné ciele potrebujú **30–50 konverzií týždenne**. Pod týmto prahom sa má **začať na Traffic / Landing Page Views**, aby sa vôbec vygeneroval signál.

Pri 10 €/deň nemá šancu spraviť 50 nákupných konverzií/týždeň. Optimalizovať na `OFFSITE_CONVERSIONS` by znamenalo trvalé zaseknutie v learning phase.

→ **Teraz `LANDING_PAGE_VIEWS`.** Nie je to kompromis z núdze, je to predpísaný postup pri nízkom objeme.

**Postupnosť:**
1. `LANDING_PAGE_VIEWS` — kým nechodí signál
2. `LEAD_GENERATION` (Instant Form) — keď sa odsúhlasí Lead Gen ToS
3. `OFFSITE_CONVERSIONS` — až pri ~50 lead eventoch/týždeň

### 💡 Silný argument pre Instant Form (nezávislý od rozbitého pixelu)
On-form leady sú **lacnejšie a početnejšie** než web leady. Pri 10 €/deň je Instant Form **jediná reálna cesta, ako sa vôbec priblížiť k 50 udalostiam/týždeň** a dostať ad-set z learning phase.
→ Odsúhlasenie Lead Gen ToS nie je „nice to have", je to **hlavná páka** tohto rozpočtu.

### Atribučné okno
Best practice pre lead gen: **7-dňový klik / 1-dňové zobrazenie**. 28-dňový klik sa už neodporúča.
⚠️ Pri `LANDING_PAGE_VIEWS` Meta povoľuje len `(1, 0)` — širšie okno bude dostupné až po prechode na konverzný cieľ.

### Bid strategy
**Lowest Cost bez capu** ✔ správne pre testovaciu fázu. Cost Cap má zmysel až keď existuje overený cieľový cost-per-result (nastaviť na 1,2–1,5× cieľ).

---

## 5. Štruktúra a kreatíva

| pravidlo | stav |
|--|--|
| 1 konsolidovaná kampaň | ✔ |
| 1 ad-set (nefragmentovať pri malom rozpočte) | ✔ |
| **3–5 reklám**, každá = iná hypotéza (hook / uhol / formát) | ✔ 3 (video · pred-po carousel · testimonial) |
| >5 reklám v ad-sete riedi rozpočet | ✔ dodržané |
| Po 7–10 dňoch vypnúť spodných 50 % podľa cost-per-result | ⬜ proces |
| Frekvencia >3,5 za 7 dní = saturácia → obmeniť kreatívu | ⬜ monitoring |
| Škálovať max **+20–25 % každé 3–4 dni** (väčší skok resetuje learning) | ⬜ pravidlo |
| Počas „Learning Limited" nerobiť veľké zmeny | ⬜ pravidlo |

**CBO vs ABO:** best practice = ABO na testovanie, CBO na škálovanie. Pri **jednom** ad-sete sú funkčne identické (všetok rozpočet ide tak či tak tam) → CBO ponechané, prerábať to nemá zmysel.

---

## 6. Meranie — nepreskočiteľné pred spustením

Best practice 2026 označuje **Pixel + CAPI duálne nasadenie za povinné** (obchádza iOS a adblockery). Kontrolný zoznam pred prvým eurom:

| | stav |
|--|--|
| Pixel na webe | ✅ `2324280084711918` nasadený na všetkých 3 stránkach |
| Pixel priradený k ad účtu | ❌ *Promoted Object Invalid* → priradiť v Business Settings |
| CAPI (server-side) | ❌ nie je |
| Deduplikácia Pixel↔CAPI (`event_id`) | ❌ nie je |
| Event Match Quality > 6,0 | ⬜ overiť v Events Manageri po nábehu |
| **UTM parametre na cieľových URL** | ❌ **chýbajú** — bez nich GHL nevie, ktorá reklama priniesla lead |
| Lead event potvrdený v test mode pred spustením | ⬜ |

> ⚠️ **UTM je reálna diera.** Kreatívy sú v Mete nemenné, takže doplnenie UTM = vytvoriť 3 nové kreatívy + 3 nové reklamy. Spravím na pokyn.

---

## 7. Zhrnutie — čo je teraz nastavené na ad-sete `120249149463090477` (PAUSED)

| nastavenie | hodnota | opreté o |
|--|--|--|
| Prítomnosť | **`home`** (bývajú tu) | logika ponuky: služba doma u zákazníka |
| Advantage+ Audience | **vypnuté** | 4 z 5 best-practice dôvodov pre vypnutie |
| Pohlavie | ženy (tvrdé) | ponuka je adresovaná ženám |
| Vek | **30–65 (tvrdé)** | logika kupujúceho, horný okraj otvorený |
| Rádius | **30 km od Trnavy** | 🟠 *potrebuje potvrdenie klientky* |
| Umiestnenia | FB feed + FB Reels + IG feed | máme len feed formáty; cieľ = A+ placements po 9:16 |
| Optimalizácia | `LANDING_PAGE_VIEWS` | predpis pri <50 konverziách/týždeň |
| Bid | Lowest Cost | testovacia fáza |
| Štruktúra | 1 / 1 / 3 | konsolidácia pri malom rozpočte |

### 🟠 Otvorená otázka na Miriam
**Ako ďaleko reálne chodí na 90-minútovú diagnostiku?** Rádius sa má rovnať jej skutočnej servisnej oblasti — nie odhadu. 30 km je zástupná hodnota.

### Poradie ďalších krokov (podľa dopadu)
1. **Lead Gen ToS** → Instant Form → jediná cesta k dostatočnému objemu udalostí pri 10 €/deň
2. **Priradiť pixel** k ad účtu + **CAPI** + deduplikácia
3. **UTM** na cieľové URL (nové kreatívy)
4. **9:16 kreatíva** → prepnúť na Advantage+ Placements
5. Potvrdiť servisný rádius
6. Zvážiť rozpočet 30–50 €/deň, ak sa má z toho stať kanál

---

## Zdroje
- [AdLibrary — How to Structure Meta Ad Campaigns (2026)](https://adlibrary.com/posts/how-to-structure-meta-ad-campaigns) — CBO/ABO, počty ad-setov a reklám, learning phase, atribúcia, bid strategy
- [Linear Design — Meta's Advantage+ Audience 2026](https://lineardesign.com/blog/metas-advantage-audience/) — tvrdé vs mäkké kontroly, prah $30/deň
- [Jon Loomer — Advantage+ Audience vs Original Audiences](https://www.jonloomer.com/advantage-audience-vs-original-audiences/)
- [Jon Loomer — Big Change to Meta Ads Location Targeting](https://www.jonloomer.com/big-change-to-meta-ads-location-targeting/) — zrušenie voľby v UI
- [Stackmatix — Meta Ads Minimum Daily Budget 2026](https://www.stackmatix.com/blog/meta-ads-minimum-daily-budget-2026)
- [Stackmatix — Local Facebook Ads Targeting](https://www.stackmatix.com/blog/local-facebook-ads-targeting)
- [AdNabu — Meta Advantage+ Placements: When to Use Them](https://blog.adnabu.com/facebook/meta-advantage-plus-placements/)
- [TheOptimizer — Meta Ads Placement Control 2026](https://theoptimizer.io/blog/meta-ads-placement-control-in-2026-how-to-actually-block-placements-its-not-as-simple-anymore)
- [Bigeye — Geographic Targeting for Meta Ads 2026](https://www.bigeyeagency.com/insights/geographic-targeting-for-meta-ads-guide-2026)
- [Get-Ryze — Meta Ads Cost for Local Business 2026](https://www.get-ryze.ai/blog/meta-ads-cost-local-business-what-spend-2026)
- Živé API testy v účte `1210955550121224` (`location_types: ["home"]` prijaté; `age_min` pri A+A odmietnuté)

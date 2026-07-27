# KROK ADS (build) — Meta kampaň POSTAVENÁ (PAUSED) v živom účte

_Ad účet **`1210955550121224`** (business „Miriam Czompoly“), EUR, ACTIVE. Štruktúra podľa `step6b-ad-structure-10eur.md`. **Všetko PAUSED — neminie sa ani cent, kým to sami nezapnete.**_

## ✅ Postavené ID
| úroveň | názov | ID |
|--|--|--|
| Kampaň | SHAPELESSAI – Lead magnet 5 chýb (10€/deň) | `120249149459200477` |
| Ad-set | Trnava +35km · ženy 30–60 · Advantage+ · 5 chýb | `120249149463090477` |
| Reklama 1 | R1 – VIDEO (nenanútim ti štýl) | `120249149475280477` |
| Reklama 2 | R2 – CAROUSEL (Pred/Po) | `120249149476210477` |
| Reklama 3 | R3 – TESTIMONIAL (Iveta) | `120249149477810477` |

Kreatívy: `907969479011200` (video) · `1506710157922272` (carousel) · `1030501176497988` (statika).
Stránka: `948130755047217` · IG: `miriamczompoly.design` (`17841466487676511`).

## ✅ Nastavenia (presne podľa reportu)
- **1 kampaň / 1 ad-set / 3 reklamy** — nefragmentovaný rozpočet (§0 reportu).
- Cieľ **OUTCOME_LEADS**, **CBO 10 €/deň** (`daily_budget: 1000` centov), bid `LOWEST_COST_WITHOUT_CAP`.
- Geo: **Trnava + 35 km** (custom location 48.3774 / 17.5883, SK).
- **Ženy 30–60**, Advantage+ Audience (broad), Advantage+ umiestnenia (FB + IG).
- **CTA „Stiahnuť" (`DOWNLOAD`)** na všetkých 3 — opravená chyba starých reklám (`BOOK_TRAVEL`).
- Copy = presné znenie zo `step6b` §3, prepnuté na **tykanie** (nový tón).
- DSA (EU povinnosť): beneficiary + payor = Miriam Czompoly.

## ✅ Kreatívy — reálne médiá (nie placeholdery)
- **R1 video:** existujúce „Reklama miriam.mp4" (`2557318217998659`) — vizuálne overené: Miriam do kamery + reálne Google recenzie (Gašparíková, Novotná) + pred/po realizácií. Bez on-screen textu starej ponuky. Thumbnail = obývačka z GHL knižnice.
- **R2 carousel (5 kariet):** karta 1 = **reálne „po"** kuchyne, karta 2 = **reálne „pred"** tej istej kuchyne (overený pár), karty 3–5 = reálne realizácie (tehlová obývačka, premena domova, kuchyňa na kľúč).
- **R3 statika:** reálna fotka spálne + recenzia v texte.

## ⚠️ Odchýlky od reportu (a prečo)

**1. Instant Form NEJDE — destinácia je web.**
Report §1 odporúčal Meta Instant Form. Všetky 3 stránky účtu majú `leadgen_tos_accepted: false` → Meta odmieta lead-gen ad-set. **Riešenie:** reklamy vedú na `/5-chyb` landing s reálnym GHL formulárom — lead padne do GHL rovnako. Optimalizácia = `LANDING_PAGE_VIEWS`.
→ **[B] Akcia:** niekto s právami na stránku musí odsúhlasiť Lead Gen ToS: https://www.facebook.com/legal/leadgen/tos — potom viem prepnúť na Instant Form.

**2. Recenzia v R3 — použil som overené znenie.**
Report mal „Mala som pocit, akoby moju dušu preložila do priestoru." To sa v zdrojoch nenachádza. Použil som doložené znenie zo `step6c`: „Citila som sa ako u psychologičky pre priestor… máš neskutočný cit… určite odporúčam." — Iveta, Trnava. Vkladať reálnej klientke do úst nedoložený citát vo verejnej reklame nejdem.

**3. Pixel nešiel priradiť k ad-setu.**
`promoted_object` s pixelom `2324280084711918` („konzultácia") vrátil *Promoted Object Invalid* — pixel pravdepodobne nie je zdieľaný s týmto ad účtom. Ad-set beží bez promoted_object.
→ **[B] Akcia:** v Business Settings priradiť pixel k ad účtu `1210955550121224`.

**4. Upload obrázkov cez API je pre tento účet zamknutý** (`ads_creative_upload_image` → „gradually being rolled out"). Obišiel som to priamymi `image_url` z GHL CDN — funguje.

## 🟠 [B] Pred zapnutím (kontrolný zoznam)
1. **Lead Gen ToS** (viď vyššie) — ak chcete Instant Form.
2. **Priradiť pixel** k ad účtu.
3. **Doména** — reklamy dnes vedú na `miriam-web-staging.pages.dev`. Po DNS cutover prepnúť `link_url` + `conversion_domain` na `miriamczompoly.sk`.
4. **Overiť audio R1 videa** — vizuálne je čisté, ale hovorené slovo som overiť nevedel. Ak spomína „konzultácia zadarmo", video treba vymeniť (bije sa s platenou diagnostikou 249 €). Video má tiež 67 s; report odporúčal 15–30 s.
5. **Súhlas Ivety** so zverejnením mena v reklame.
6. **Schváliť rozpočet a zapnúť** (spend = peniaze klientky).

## Pravidlo vyhodnotenia (zo `step6b` §4)
Každej reklame nechať minúť ~30–50 € (pri 10 €/deň = 3–5 dní), až potom vypínať. Merať **LTGP : CAC ≥ 3:1**, nie CPL.

## Rollback
Zmazať kampaň `120249149459200477` (zmaže aj ad-set a 3 reklamy) + 3 kreatívy podľa ID vyššie.

# OPRAVY blokátorov z `AUDIT-golive-readiness.md`

_Vykonané 26. 7. 2026. Každá položka overená po zápise, nie len odoslaná._

---

## ✅ B1 — Lead magnet PDF vytvorený

**„5 najdrahších chýb, ktoré ľudia robia vo svojom byte"** — 9 strán, A4.

- Zdroj: `client-miriam/ebook/build_ebook.py` (reprodukovateľné, dá sa prepísať a znovu vygenerovať)
- Živé PDF: `https://assets.cdn.filesafe.space/o86atLjsdR9IoUTWgYna/media/d68c8922-e5af-4443-9e14-e89354c82dad.pdf` (overené HTTP 200, 82 kB)

**Tón — odvodený z jej vlastných e-bookov** (`Tajomstvá ideálnej spálne` som prečítal celý):
tykanie · prvá osoba · konkrétne čísla (90 cm, 2700–3000 K, 145–150 cm) · priamo k veci bez omáčok · pätička `WWW.MIRIAMCZOMPOLY.SK` · mäkké CTA na konci.

**Obsah — zosúladený s copy, ktorá už beží** (aby si nič neprotirečilo):
| # | chyba | odkiaľ |
|--|--|--|
| 1 | Kupuješ skôr, než máš plán | E3 „koberec sem, lampa tam" |
| 2 | Nábytok „polepený" o steny, miestnosť bez centra | **E2 hovorí „v bode 2 sa spoznáš" — sedí** |
| 3 | Zablokovaný vstup a cesty | reklama R2 |
| 4 | Jedno svetlo v strede stropu | jej vlastný prístup k osvetleniu |
| 5 | Rozmery „od oka" (koberec, závesy) | reklama R2 + E3 |

Každá chyba má rovnakú štruktúru: text → **KOĽKO ŤA TO STOJÍ** → **ČO S TÝM** (krok zadarmo, hneď dnes).
Posledná strana = predaj diagnostiky 249 € + odpočet z projektu + scarcity 3–4 projekty mesačne.

> Nevymýšľal som žiadne štatistiky ani klientske príbehy. „9 z 10 bytov" je prevzaté z už schválenej E2.

---

## ✅ B2 — Formulár teraz spúšťa workflow (tvoj návrh, a je správny)

Pôvodne: WF1 čakal na tag `lead-magnet`, ktorý nikto nepridával → reťaz nikdy nezbehla.

**Teraz:** WF1 trigger prepnutý `contact_tag` → **`form_submission`** s podmienkou `form.id = geA4rea6TYWIKcskupXQ`.
Do workflowu pridaný **prvý krok „Tag: lead-magnet"** (`add_contact_tag`), takže segmentácia a reporting podľa tagu ostávajú funkčné — len už nie sú podmienkou spustenia.

```
Odoslaný formulár „5 chýb“
   └─ Tag: lead-magnet          ← nový krok
        └─ E1 dodanie e-booku
             └─ E2 · S1 · E3 · E4 · E5
```
Overené: trigger `form_submission`, `targetActionId` ukazuje na existujúci krok.

---

## ✅ B3 — Odkazy už nevedú na 404

| custom value | pred | teraz |
|--|--|--|
| Link ebook PDF | `miriamczompoly.sk/5-chyb` → **404** | priamy odkaz na PDF ✅ |
| Link diagnostika | `miriamczompoly.sk/diagnostika` → **404** | `miriam-web-staging.pages.dev/diagnostika` ✅ |
| Link 5 chýb | `miriamczompoly.sk/5-chyb` → **404** | `miriam-web-staging.pages.dev/5-chyb` ✅ |
| Funnel link | `miriamczompoly.sk` | staging URL ✅ |

⚠️ Po DNS cutover treba tieto 4 hodnoty prepísať na ostrú doménu — je to jeden skript, spravím na pokyn.

---

## ✅ B4 (čiastočne) — potvrdenie rezervácie rieši nový WF3

Natívne notifikácie kalendára cez API **nastaviť nejde** (viď „Čo som nedokázal"). Obišiel som to workflowom:

**WF3 – Pred diagnostikou (potvrdenie)** `e8120656-58f4-498f-95c8-2ca6e67123ef`
- Trigger: `customer_appointment` na kalendári „Interiérová diagnostika"
- Kroky: `Tag: diagnostika-rezervovana` → **E9 potvrdenie + príprava**
- E9 obsahuje: termín, miesto, dĺžku, čo si pripraviť (pôdorys, zoznam problémov, rozpočet, prítomnosť partnera), „nemusíš upratovať" a možnosť presunu termínu

---

## ✅ V2 — Staging už nie je indexovateľný
`<meta name="robots" content="noindex, nofollow">` na všetkých 3 stránkach + `robots.txt` s `Disallow: /`. Overené naživo (po prejdení CDN cache).

---

# ⚠️ Čo som NEDOKÁZAL opraviť

Poctivo — toto sú veci, ktoré cez API nejdú alebo nie sú moje:

### 1. Natívne notifikácie kalendára 🔴 *technický limit*
`PUT /calendars/{id}` s `notifications` vráti **200 a v odpovedi notifikáciu vypíše**, ale následný `GET` stále vráti `[]`. Skúsil som 4 rôzne tvary schémy; posledný prešiel validáciou, ale **nepersistuje sa**.
→ **Riešenie:** funkčne to nahrádza WF3 (vyššie). Ak chcete aj natívne potvrdenie, treba **klik v GHL UI**.

### ~~2. SMS kanál~~ ✅ VYRIEŠENÉ
Potvrdené: SMS ide cez **vlastného providera napojeného cez n8n**. Send SMS nody vo workflowoch fungujú normálne. Preto som 0 SMS konverzácií v účte videl, prevádzka nejde cez natívny GHL kanál.

### ~~3. E-mailová doména~~ ✅ VYRIEŠENÉ
Doména je overená a nastavená.

### 4. Veci mimo môj dosah *(vaše / klientkine)*
- **DNS cutover** `miriamczompoly.sk` → Cloudflare
- **Priradenie pixelu** k ad účtu (Business Settings) + **Lead Gen ToS**
- **Platobná brána** 249 € v GHL UI
- **Fotky k menným case studies** (Iveta/Dimová/Valentínová) — bez priradenia od Miriam by to bola nepravdivá atribúcia
- **9:16 kreatíva** pre Advantage+ Placements
- **Overenie audia** videa R1
- **Schválenie cien** klientkou → až potom publikovať a tagovať 84 kontaktov

### 5. Čo viem, ale zámerne som zatiaľ nespravil
- **UTM na reklamné URL** — vyžaduje 3 nové kreatívy + 3 reklamy (kreatívy sú v Mete nemenné). Spravím na pokyn.
- **WF7 recenzie** — postavím spolu s dokončením WF3 (pripomienky 2 h / 10 min pred termínom potrebujú appointment-relatívne čakania).
- **Publikovanie workflowov + vypnutie starých** — až po schválení cien, inak sa rozbehnú sekvencie.

---

## Stav po opravách

| blokátor | pred | teraz |
|--|--|--|
| B1 lead magnet | 🔴 neexistoval | ✅ vytvorený a nahraný |
| B2 formulár → workflow | 🔴 pretrhnuté | ✅ form_submission trigger |
| B3 odkazy 404 | 🔴 všetky | ✅ všetky funkčné |
| B4 potvrdenie rezervácie | 🔴 žiadne | ✅ cez WF3 |
| B5 workflowy | 🔴 draft | 🟠 stále draft *(zámerne — čaká na ceny)* |
| B6 SMS | 🔴 neznáme | 🟠 stále neznáme *(treba UI)* |

**Reťaz lead → e-book → nurture → diagnostika je teraz spojitá.** Zostáva ju zapnúť — a to je rozhodnutie o cenách, nie technická úloha.

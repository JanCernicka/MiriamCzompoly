# AUDIT — Čo by sa stalo, keby to zapneme TERAZ

_Overené naživo v účte `o86atLjsdR9IoUTWgYna` a v ad účte `1210955550121224` dňa 26. 7. 2026. Nie z pamäte — všetko dotiahnuté cez API._

## Verdikt

# 🔴 NEZAPÍNAŤ

Systém **nie je funkčný ako celok**. Jednotlivé diely stoja, ale **reťaz je pretrhnutá na troch miestach naraz** a peniaze z reklám by tiekli do slepej uličky.

---

## Čo by sa reálne stalo, krok po kroku

Predstav si ženu z Trnavy, ktorá zajtra klikne na reklamu:

| # | krok | čo sa stane | stav |
|--|--|--|--|
| 1 | Klikne na reklamu | Príde na `miriam-web-staging.pages.dev/5-chyb` — funguje, HTTP 200 | ✅ |
| 2 | Vidí URL | V prehliadači má **`miriam-web-staging.pages.dev`**, nie `miriamczompoly.sk` | 🟠 dôveryhodnosť |
| 3 | Vyplní formulár | Kontakt **padne do GHL** správne | ✅ |
| 4 | Očakáva e-book | **NIČ NEPRÍDE.** Formulár nepridáva tag `lead-magnet` → WF1 sa nespustí | 🔴 |
| 5 | Aj keby prišiel | WF1 je **draft**, trigger `active: false` → neposiela sa nič | 🔴 |
| 6 | Aj keby bežal | E-mail odkazuje na `{{custom_values.link_ebook_pdf}}` = `miriamczompoly.sk/5-chyb` → **404** | 🔴 |
| 7 | Aj keby link fungoval | **E-book „5 najdrahších chýb" NEEXISTUJE.** V media library nie je | 🔴 |
| 8 | Chce si rezervovať | Kalendár funguje, rezervácia prejde | ✅ |
| 9 | Po rezervácii | **Nedostane žiadne potvrdenie** — kalendár má `notifications: 0` | 🔴 |
| 10 | Zaplatiť 249 € | Nedá sa — platobná brána nie je napojená | 🟠 |

**Zhrnutie: zaplatíš za klik, získaš e-mail do databázy, a klientka nedostane nič.** Sľúbili sme jej v reklame e-book, ktorý neexistuje. To je najhoršia možná prvá skúsenosť — a zároveň dôvod na sťažnosti u Mety.

---

## 🔴 BLOKÁTORY (bez nich sa zapnúť nedá)

### B1. Lead magnet neexistuje
Všetky 3 reklamy aj celý web sľubujú **„5 najdrahších chýb, ktoré ľudia robia vo svojom byte"**. V media library sú len 3 iné PDF:
`Sprievodca teóriou farieb.pdf` · `Tajomstvá spálne.pdf` · `6 tipov ako oživiť svoj interiér.pdf`

→ **[B] Miriam musí vytvoriť PDF.** Bez neho je celá kampaň sľub, ktorý nevieme splniť.
_Alternatíva na odomknutie: dočasne prepnúť ponuku na „6 tipov ako oživiť svoj interiér" (existuje) a prepísať copy — ale to oslabuje hook._

### B2. Formulár nespúšťa workflow — pretrhnutá reťaz
Formulár `geA4rea6TYWIKcskupXQ` **neobsahuje žiadnu tag akciu**. WF1 čaká na tag `lead-magnet`, ktorý nikto nepridá.
→ **[A] Spravím ja:** buď pridám tag akciu na formulár, alebo prehodím WF1 trigger z „tag added" na „form submitted".

### B3. Odkazy v e-mailoch vedú na 404
| custom value | hodnota | reálny stav |
|--|--|--|
| Link diagnostika | `miriamczompoly.sk/diagnostika` | **404** |
| Link 5 chýb | `miriamczompoly.sk/5-chyb` | **404** |
| Link ebook PDF | `miriamczompoly.sk/5-chyb` | **404** |

Overené `curl`om. Starý web na `miriamczompoly.sk` beží (200), ale tieto podstránky na ňom nie sú.
→ **[A] Spravím:** buď prepnúť na staging URL (dočasne), alebo počkať na DNS cutover.

### B4. Nikto nedostane potvrdenie rezervácie
Všetky **3 kalendáre** majú `notifications: 0` — vrátane nového „Interiérová diagnostika". Kto si rezervuje termín, nedostane potvrdenie ani pripomienku.
→ **[A/B]:** doriešiť notifikácie (predtým padalo na 422) alebo dokončiť WF3.

### B5. Workflowy sú vypnuté
5 workflowov postavených, **všetky draft, všetky triggery `active: false`**. WF3 (pripomienky) a WF7 (recenzie) **vôbec neexistujú**.
→ **[A] Publikovať** — ale až po B1–B4, inak by len rozposielali rozbité odkazy.

### B6. SMS kanál pravdepodobne nefunguje
V účte je **0 SMS konverzácií** (20 posledných: 19× Instagram, 1× e-mail). Sekvencie obsahujú **S1–S7 SMS kroky**.
→ **[B] Overiť v GHL UI**, či je provisionované SMS číslo. Ak nie, všetky SMS kroky padnú. *(Cez API sa to nedalo definitívne overiť — nechcem tvrdiť viac, než viem.)*

---

## 🟠 VÁŽNE, ALE NIE BLOKUJÚCE

| # | vec | dopad |
|--|--|--|
| V1 | **Doména** — reklamy vedú na `*.pages.dev` | Nižšia konverzia a dôvera; treba DNS cutover |
| V2 | **Staging je indexovateľný** (žiadny `noindex`, robots.txt 200) | Google môže naindexovať staging → duplicita s ostrým webom |
| V3 | **Pixel nie je priradený** k ad účtu (*Promoted Object Invalid*) | Bez optimalizácie a bez retargetingu |
| V4 | **Chýba CAPI + deduplikácia** | Meranie po iOS/adblock stratí časť dát |
| V5 | **Chýbajú UTM** na cieľových URL | GHL nevie, ktorá reklama priniesla lead. Oprava = 3 nové kreatívy + 3 reklamy (kreatívy sú nemenné) |
| V6 | **Lead Gen ToS neodsúhlasený** | Instant Form nejde — a je to hlavná páka pri 10 €/deň |
| V7 | **Platba 249 €** nie je napojená na rezerváciu | Filter kvality nefunguje; platí sa mimo systém |
| V8 | **Staré assety stále živé** — 2 staré kalendáre „Bezplatná konzultácia", 3 staré formuláre, 2 publikované staré workflowy | Nová a stará ponuka bežia súbežne → protirečia si |
| V9 | **9 placeholderov na webe** (menné case studies) | Viditeľné `[B]` texty na ostrom webe |
| V10 | **Chýba 9:16 kreatíva** | Nedá sa zapnúť Advantage+ Placements |
| V11 | **Video R1 má 67 s** a neoverené audio | Ak spomína „konzultácia zadarmo", bije sa s platenou diagnostikou |

---

## ✅ ČO JE V PORIADKU (overené)

- **Pipeline** — 10 stage-ov, 21 príležitostí sedí, nič sa nestratilo
- **11 tagov** — všetky existujú, presne podľa špecifikácie
- **10 custom values** — ceny sú správne (249 € / od 1 090 € / od 3 900 € / od 8 000 €)
- **Kalendár** „Interiérová diagnostika" — aktívny, 90 min, Po–Pia 9–17
- **Formulár** „5 chýb" — funguje, kontakt padne do GHL
- **Web** — všetky 3 stránky HTTP 200, GHL iframe napojené, Pixel `2324280084711918` nasadený, reálne fotky
- **Kampaň** — 1/1/3 podľa best practice, správne cielenie, `location_types: home`, **všetko PAUSED**
- **84 kontaktov** v databáze pre WF2 reaktiváciu
- **Timezone** `Europe/Amsterdam` — kozmeticky nesprávne, ale **funkčne v poriadku** (Amsterdam aj Bratislava = CET, rovnaký posun). Nie je to chyba.

---

## Poradie opráv (čo najskôr odblokuje spustenie)

### [A] — spravím ja, hneď na pokyn
1. **Prepojiť formulár → tag `lead-magnet`** (B2) — ~10 min
2. **Prepnúť custom values na funkčné URL** (B3) — ~5 min
3. **Postaviť WF3 + WF7** a doriešiť potvrdenie rezervácie (B4, B5)
4. **Pridať `noindex`** na staging (V2)
5. **Nové kreatívy s UTM** (V5)
6. **Publikovať workflowy + vypnúť staré** (B5, V8) — až úplne nakoniec

### [B] — musí klientka / ty
1. 🔴 **Vytvoriť PDF „5 najdrahších chýb"** ← *najväčší blokátor, všetko ostatné naň čaká*
2. 🔴 **Overiť SMS číslo** v GHL UI
3. 🟠 **DNS cutover** `miriamczompoly.sk` → Cloudflare
4. 🟠 **Priradiť pixel** k ad účtu + Lead Gen ToS
5. 🟠 **Platobná brána** 249 € v GHL UI
6. 🟠 **Dodať fotky** k menným case studies + 9:16 kreatíva
7. 🟠 **Overiť audio** videa R1

---

## Odpoveď na otázku „čo by sa pokazilo?"

**Nepokazilo by sa nič dramaticky — to je práve ten problém.** Nič by nevybuchlo, žiadna chyba by sa neukázala. Len by:

1. **Tíško odtekal rozpočet** — 10 €/deň za kliky do slepej uličky
2. **Každý lead by ostal bez odozvy** — dali email, nedostali nič, po pár dňoch zabudli
3. **Spálilo by to najdrahší zdroj** — prvý dojem. Tí istí ľudia druhýkrát nekliknú
4. **Rozbilo by to meranie** — bez UTM a pixelu by sme ani spätne nevedeli, čo fungovalo

Najlacnejšia oprava je **teraz**. Blokátory B2, B3, B4 viem odstrániť sám za pár hodín. Reálny kritický reťazec je **PDF e-book** — bez neho nemá zmysel spúšťať nič, lebo je to presne to, čo v reklame sľubujeme.

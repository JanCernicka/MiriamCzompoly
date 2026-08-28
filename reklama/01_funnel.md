# Lievik: preberáš byt a chceš to spraviť raz a poriadne

Postavené podľa `playbook/04_funnel/`. **Reklama predáva interiérovú diagnostiku za 249 €,
nie niečo zadarmo.** Prečo práve tak, je v [`README.md`](README.md).

---

## Celý reťazec

```
Meta reklama (10+ videí, 1 copy, 20 €/deň)
        │             sľubuje diagnostiku 249 €, checklist ako bonus, odpočet z projektu
        ▼
/                     LANDING PAGE
        │             žiadne menu, cena uvedená, všetky CTA vedú na /dotaznik
        ▼
/dotaznik             KVÍZ, tri obrazovky, jedna otázka na obrazovku
        │             1 z 3  e-mail       -> kontakt do GHL HNEĎ, tag kviz-zacal
        │             2 z 3  kedy preberá -> tag preberam-*
        │             3 z 3  podklady     -> tag podklady-*
        ▼
/ponuka               PONUKA A PLATBA
        │             celý stack, cena, garancia, odpočet
        │             formulár s platobným prvkom: meno, telefón, adresa bytu, karta
        │
        ├── zaplatila ──► KALENDÁR „Interiérová diagnostika", 90 min
        │                 tag diagnostika-zaplatena, pipeline 3
        │                 checklist na e-mail HNEĎ
        │
        └── nezaplatila ─► tag nekupila-ponuku, pipeline 1
                           o 24 h checklist tak či tak, potom sekvencia na námietky
```

**Každý krok má jediný cieľ: dostať sa do ďalšieho kroku.**
**Kalendár nie je dostupný nikomu, kto nezaplatil.**

---

## Prečo štyri samostatné stránky

Na landing page sa dá odskrolovať a odísť. Na stránke s kvízom nie je nič iné, takže kto
naň klikne, má presne jednu vec, ktorú môže spraviť. **Stránka s ponukou je nová**, lebo
lievik teraz niečo predáva a predaj potrebuje vlastnú stránku, nie odsek v päte.

⚠️ **Súčasný stav sa od toho líši.** Živá stránka `miriam-checklist.pages.dev` má formulár
priamo v hero sekcii, teda je to jedna stránka. Stránka s ponukou neexistuje vôbec.
**Pred spustením reklamy to treba dostavať.**

---

## Stránka 1: landing page `/`

### Poradie sekcií

Prevzaté z `playbook/04_funnel/STRUKTURA_LANDING_PAGE.md`, sociálny dôkaz ide **pred**
„o mne", lebo človek prichádza z reklamy nedôverčivý.

| # | Sekcia | Čo tam je |
|---|---|---|
| 0 | **Hero** | „Kým podpíšeš preberací protokol" + čo je diagnostika + **cena** + prvé CTA |
| 1 | **Sociálny dôkaz** | ⚠️ len ak má reálne recenzie. Inak sekciu vynechať, nie vymyslieť. |
| 2 | **Prečo to riešiť teraz** | uzávierka klientských zmien, tri konkrétne príklady |
| 3 | **Kto som** | tvár za tým, od roku 2010, chodí do bytu pred preberaním |
| 4 | **Námietka: „to mi povie developer"** | povie, ale až keď sa spýtaš, a niektoré veci už nepovie vôbec |
| 5 | **Námietka: „prečo je to platené"** | jej vlastná odpoveď z webu: aby si dostala hodnotu, nie predajný hovor, a suma sa odpočíta z projektu |
| 6 | **Čo dostaneš za 249 €** | celý stack po položkách |
| 7 | **CTA** | „Chcem termín" |

### Pravidlá

- 🔴 **Žiadne menu, žiadny odkaz na hlavný web, žiadne sociálne siete.**
- Všetky tlačidlá vedú na `/dotaznik`. Text sa môže líšiť, cieľ nie.
- 🔴 **Cena musí byť nad záhybom.** Kto ju uvidí až pri platbe, cíti sa nachytaný a odíde.
- Nad záhybom musí byť vidieť to, čo sľúbila reklama: diagnostika, 90 minút, u teba doma.

### Meta description

Hovorí o probléme, nie o firme:

> Väčšina vecí, ktoré ťa v novom byte budú štvať, sa rozhoduje mesiace pred preberaním.
> Deväťdesiat minút v byte a vieš, čo si od developera vypýtať.

---

## Stránka 2: kvíz `/dotaznik`

```
Otázka 1 z 3
  „Než ti ukážem termíny, tri otázky."
  „Chodím na miesto osobne, tak si najprv overím, či ti viem pomôcť."
  -> pole: e-mail
  -> 🔴 kontakt sa zapíše do GHL HNEĎ po tomto kroku

Otázka 2 z 3
  „Kedy preberáš byt?"
  -> Do 3 mesiacov · Do roka · Ešte neviem · Už v ňom bývam

Otázka 3 z 3
  „Máš už od developera podklady?"
  -> Mám všetko · Niečo mám · Nemám nič · Neviem, čo mám mať
```

### Prečo tieto tri otázky

**E-mail prvý, a rámovaný ako kvalifikácia, nie ako zber kontaktov.** Lead je zachytený
hneď, ešte než vôbec padne cena. Rámovanie „overím si, či ti viem pomôcť" je pravdivé,
lebo Miriam naozaj jazdí na miesto, a zároveň dvíha jej status. Presne to robí eRevenue
svojím „Hľadám majiteľov, ktorí…".

**Otázka 2 je segmentácia.** Kto preberá do 3 mesiacov, uvidí ponuku s najväčším dôrazom
na uzávierku. Ostatní bez tlaku.

**Otázka 3 predáva za nás.** Kto klikne „neviem, čo mám mať", si v tej sekunde uvedomí,
že problém má. Ďalšia obrazovka je ponuka.

### 🔴 Odchýlka od playbooku: telefón až pri platbe

Playbook má telefón v treťom kroku kvízu. **Miriam výslovne povedala iba e-mail**, tak je
v kvíze iba e-mail. Pri platbe sa telefón aj adresa pýtať musia, lebo ide o osobnú návštevu
a termín treba potvrdiť. V objednávkovom formulári ich človek dá rád, lebo už niečo kupuje.

Dôsledok pre tých, čo nekúpia: follow-up ide len e-mailom, žiadna SMS.

### Pravidlá

- maximálne tri kroky, viac znamená odpad
- jedna otázka na obrazovku
- posledný krok: „Odoslaním potvrdzuješ…" a checkbox na novinky (GDPR)

---

## Stránka 3: ponuka a platba `/ponuka`

**Toto je najdôležitejšia stránka celého lievika** a musí byť najlepšie odpracovaná.
Studená návštevnosť z Instagramu, ktorá zadáva kartu na 249 €, je najtvrdší krok
v reťazci a všetko ostatné existuje preto, aby ho uľahčilo.

### Čo na nej musí byť

| Prvok | Prečo |
|---|---|
| **Celý stack po položkách** | 90 minút na mieste, analýza dispozície, plán priorít, zoznam „čo prestať kupovať", zoznam zmien pre developera |
| **Cena 249 €** a hneď pod ňou **odpočet z projektu** | Kto pokračuje, zaplatí za diagnostiku nakoniec nula. |
| **Bonus: checklist hneď po rezervácii** | Hodnota v ten istý deň, nečaká na termín. |
| **Garancia, veľká a nad tlačidlom** | „Ak neodídeš s jasnom, povedz mi to na mieste a peniaze ti vrátim." |
| **Kotva hodnoty** | Jej vlastná veta z webu: jedna zle kúpená sedačka stojí stovky až tisíce eur. |
| **Formulár s platobným prvkom** | meno, telefón, **adresa bytu**, karta |

### Technicky, overená cesta

Formulár s platobným prvkom sa stavia cez **interné API**, viď `docs/produkty-a-platby.md`
v GHLtool, sekcia 6. Stripe je na sub-účte napojený.

| Nastavenie | Význam |
|---|---|
| `requireCreditCard: true` | bez karty neprejdeš |
| `formAction.actionType: "1"` | presmeruj na URL, funguje aj na formulári s platbou |
| `liveModeOn: false` | 🔴 **testovací režim, je to pasca.** Vyzerá rovnako ako ostrý a nestrhne ani cent. |

🔴 **Overiť skutočnou platbou, nie pohľadom do nastavení.**

---

## Stránka 4: kalendár, až po zaplatení

Formulár po úspešnej platbe presmeruje na kalendár **„Interiérová diagnostika"**,
90 minút, Po až Pia 9 až 17. Kalendár už v GHL existuje.

🔴 **Overiť, že kalendár nie je dostupný priamym odkazom.** Inak sa celý filter obíde.

🔴 **Kalendár mal podľa auditu `notifications: 0`.** Kto si rezervuje termín, nedostane
ani potvrdenie, ani pripomienku. Pri platenej službe je to neprijateľné.

---

## Napojenie na GoHighLevel

```
kvíz     -> Cloudflare Pages Function -> POST /contacts/upsert -> kontakt + tagy
platba   -> GHL formulár s platobným prvkom -> tag diagnostika-zaplatena
                                          │
              tag checklist-developer  -> WF-A: checklist a nurture
              tag diagnostika-zaplatena -> WF-B: potvrdenie, checklist HNEĎ, príprava na stretnutie
              tag nekupila-ponuku       -> WF-C: o 24 h checklist, potom námietky
```

### Tagy

| Tag | Kedy |
|---|---|
| `kviz-zacal` | po prvom kroku, kým sa kvíz nedokončí |
| `checklist-developer` | dokončený dotazník |
| `preberam-do-3m` · `preberam-do-roka` · `preberam-neviem` · `uz-byvam` | otázka 2 |
| `podklady-mam` · `podklady-ciastocne` · `podklady-nemam` · `podklady-neviem` | otázka 3 |
| 🔴 `diagnostika-zaplatena` | nový, po úspešnej platbe |
| 🔴 `nekupila-ponuku` | nový, videla ponuku a nezaplatila |

### Pipeline

Stavy už existujú, netreba nové:
`1 Lead → 2 Diagnostika rezervovaná → 3 Diagnostika zaplatená → 4 Diagnostika absolvovaná → 5 Ponuka projektu poslaná → 6 Projekt vyhraný`

⚠️ Keďže sa teraz platí **pred** rezerváciou, kupujúca ide rovno do stavu **3**.
Stav 2 ostáva pre kontakty, ktoré prídu inou cestou (napríklad z jej hlavného webu).

### Minimum, ktoré musí byť napojené

| # | Vec | Stav |
|---|---|---|
| 1 | kvíz zapisuje kontakt po **prvom** kroku | 🔨 treba dorobiť, teraz sa zapisuje až na konci |
| 2 | stránka `/ponuka` s platobným formulárom | 🔴 neexistuje |
| 3 | presmerovanie na kalendár po platbe | 🔴 |
| 4 | okamžitý e-mail s checklistom pre kupujúcu | 🔴 workflow čaká na prístupy |
| 5 | **notifikácia Miriam pri novom lede aj pri platbe** | 🔴 chýba |
| 6 | kalendár „Interiérová diagnostika" | ✅ existuje, 🔴 ale bez notifikácií |
| 7 | pripomienky pred termínom | ✅ existujú (WF3) |
| 8 | vetva pre tých, čo nekúpili | 🔴 |
| 9 | pipeline so stavmi | ✅ existuje |

⚠️ **Nedokončené kvízy sú tiež leady.** Kto dá e-mail a odpadne pri druhej otázke, má tag
`kviz-zacal` a musí ho chytiť samostatná sekvencia. Inak je to zaplatený a zahodený lead.

---

## Kde má lievik bývať

| | |
|---|---|
| Teraz | `miriam-checklist.pages.dev` |
| **Pred spustením reklamy** | **`checklist.miriamczompoly.sk`** |

🔴 **Reklama nesmie viesť na `pages.dev`.** Znižuje to dôveru, a keď sa na tej stránke
zadáva platobná karta, je to dvojnásobne dôležité.

Po prepnutí prejsť všetky miesta, kde je adresa zadrátovaná: custom values v GHL, odkaz
na PDF v e-mailovej šablóne, `link_url` a doména konverzie v reklamách.

---

## Kampaň

Pevné parametre z playbooku, nemeniť:

| Nastavenie | Hodnota |
|---|---|
| Cieľ | Leads |
| Denný rozpočet | **20 €** 🔒 viazané na garanciu |
| Ad sety | **1** |
| Kreatívy | **minimálne 10**, každá celé samostatné video |
| Copy | **1**, identické na všetkých reklamách |
| Lokalita | Trnava + 30 km, **len „bývajú tu"** |
| Vek | 28 až 50 |
| Pohlavie | ženy, zhodne s copy (⚠️ pod Advantage+ to Meta môže prekročiť, kvalifikuje text) |
| Záujmy | žiadne |
| Advantage+ publikum | zapnuté |
| Umiestnenia | Advantage+ |
| **Konverzná udalosť** | **Lead**, nie Purchase |
| **Merané pre biznis** | Purchase s hodnotou 249 €, ale neoptimalizuje sa naň |
| UTM | `utm_source=facebook&utm_medium=cpc&utm_campaign=diagnostika&utm_content={{ad.name}}` |
| Názvy reklám | `01_hook-otazka`, `02_hook-lokalita`, … nech vieš, ktorý hook vyhral |

### 🔴 Prečo sa neoptimalizuje na Purchase, hoci sa predáva

Je to lákavé a bola by to chyba. Meta potrebuje **rádovo desiatky konverzií týždenne**,
aby sa na nich vedela učiť. Pri 20 €/deň a ponuke za 249 € ich toľko nebude, ad set by
sa nikdy nedostal z learning phase a výkon by sa rozsypal.

**Optimalizuje sa na Lead** (e-mail z dotazníka), **vyhodnocuje sa na Purchase.**
Pixel musí páliť obe udalosti, Purchase s hodnotou 249 €.

⚠️ **Reklamy sa nevypínajú podľa ceny za e-mail, ak už majú aspoň jednu predanú
diagnostiku.** Lacný e-mail, z ktorého nikto nekúpi, je drahší než drahý e-mail, ktorý kúpi.

### Checklist pred zapnutím

```
✓ landing page rozdelená na štyri stránky
✓ kvíz zapisuje kontakt po prvom kroku
✓ stránka /ponuka s platobným formulárom, requireCreditCard
✓ ostrá skúšobná platba prešla, liveModeOn overené
✓ kalendár sa zobrazí až po platbe a nie je dostupný priamym odkazom
✓ kalendár má zapnuté notifikácie
✓ workflowy publikované a otestované reálnym odoslaním aj reálnou platbou
✓ Miriam dostane notifikáciu o novom lede aj o platbe
✓ vetva pre tých, čo nekúpili
✓ vlastná subdoména, nie pages.dev
✓ pixel nasadený, udalosti Lead aj Purchase, overené v Events Manageri
✓ cookie consent, ochrana osobných údajov, obchodné podmienky a reklamačný poriadok
✓ 10+ videí nahratých, v každom zaznie cena
✓ všetky tvrdenia v copy potvrdené Miriam
✓ Miriam potvrdila platbu vopred a garanciu vrátenia peňazí
```

⚠️ **Obchodné podmienky pribudli.** Predáva sa služba online, takže spotrebiteľské
povinnosti platia. Toto nie je voliteľné.

**Prvých 7 dní nezasahovať.** Algoritmus sa učí.

### Rozhodovací bod po 14 dňoch

Po zhruba 280 € minutých. Ak dovtedy prišli e-maily, ale **ani jedna predaná
diagnostika**, chyba nie je v cene, ale v tom, že stránka s ponukou nepredáva.
**Vtedy sa mení stránka, nie cena.** Až ak nepredá ani druhá verzia stránky,
mení sa ponuka.

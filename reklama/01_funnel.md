# Lievik: interiérová diagnostika za 249 €

Postavené podľa `playbook/04_funnel/`. **Reklama predáva 90-minútovú diagnostiku
u klientky doma. Zadarmo je iba PDF a odpočet z projektu.** Prečo práve tak,
je v [`README.md`](README.md).

---

## Celý reťazec

```
Meta reklama (10+ videí, 1 copy, 20 €/deň)
        │             sľubuje diagnostiku 249 €, PDF zadarmo, odpočet z projektu
        ▼
/                     LANDING PAGE
        │             žiadne menu, cena uvedená, všetky CTA vedú na /dotaznik
        ▼
/dotaznik             KVÍZ, tri obrazovky, jedna otázka na obrazovku
        │             1 z 3  e-mail    -> kontakt do GHL HNEĎ, tag kviz-zacal
        │             2 z 3  čo riešiš -> tag riesi-*
        │             3 z 3  kedy      -> tag kedy-*
        ▼
/ponuka               PONUKA A PLATBA
        │             celý stack, cena, garancia, odpočet, 9 miest
        │             formulár s platobným prvkom: meno, telefón, adresa, karta
        │
        ├── zaplatila ──► KALENDÁR „Interiérová diagnostika", 90 min
        │                 tag diagnostika-zaplatena, pipeline 3
        │                 PDF a príprava na stretnutie e-mailom HNEĎ
        │
        └── nezaplatila ─► tag nekupila-ponuku, pipeline 1
                           PDF tak či tak, potom sekvencia na námietky
```

**Každý krok má jediný cieľ: dostať sa do ďalšieho kroku.**
**Kalendár nie je dostupný nikomu, kto nezaplatil.**

---

## Prečo štyri samostatné stránky

Na landing page sa dá odskrolovať a odísť. Na stránke s kvízom nie je nič iné, takže
kto naň klikne, má presne jednu vec, ktorú môže spraviť. Stránka s ponukou je samostatná,
lebo lievik niečo predáva a predaj potrebuje vlastnú stránku, nie odsek v päte.

🔴 **Nič z toho zatiaľ neexistuje.** Predchádzajúci lievik bol postavený na inom segmente
(preberanie bytu od developera) a ten smer sme zrušili. Landing page aj dotazník sa
stavajú nanovo, na túto bolesť. Použiteľné ostáva: PDF „5 najdrahších chýb", kalendár
„Interiérová diagnostika" a pipeline v GHL.

---

## Stránka 1: landing page `/`

### Poradie sekcií

Prevzaté z `playbook/04_funnel/STRUKTURA_LANDING_PAGE.md`, sociálny dôkaz ide **pred**
„o mne", lebo žena prichádza z reklamy nedôverčivá.

| # | Sekcia | Čo tam je |
|---|---|---|
| 0 | **Hero** | „Máš pekné veci, no domov to stále nie je" + čo je diagnostika + **cena** + prvé CTA |
| 1 | **Poznáš to?** | štyri vety bolesti, doslovne z jej webu, aby sa spoznala |
| 2 | **Sociálny dôkaz** | ⚠️ len so súhlasom. Iveta Pappová: „Cítila som sa ako u psychologičky pre priestor." |
| 3 | **Kto som** | tvár za tým, od roku 2010, 15+ rokov, ženám v Trnave a okolí |
| 4 | **Námietka: „prečo je to platené"** | jej vlastná odpoveď z FAQ: aby si dostala hodnotu, nie predajný hovor, a suma sa odpočíta |
| 5 | **Námietka: „nanútite mi svoj štýl"** | jej garancia štýlu: návrh je na 100 % o tebe, inak prepracujem zdarma |
| 6 | **Čo dostaneš za 249 €** | celý stack po položkách + PDF ako bonus |
| 7 | **Kapacita** | 9 diagnostík mesačne, koľko je voľných |
| 8 | **CTA** | „Chcem termín" |

### Pravidlá

- 🔴 **Žiadne menu, žiadny odkaz na hlavný web, žiadne sociálne siete.**
- Všetky tlačidlá vedú na `/dotaznik`. Text sa môže líšiť, cieľ nie.
- 🔴 **Cena musí byť nad záhybom.** Kto ju uvidí až pri platbe, cíti sa nachytaný a odíde.
- Nad záhybom musí byť to, čo sľúbila reklama: 90 minút, u teba doma, plán priorít.

### Meta description

Hovorí o probléme, nie o firme:

> Investovala si do bývania a doma sa aj tak necítiš doma. Deväťdesiat minút
> a vieš, kde je skutočný problém a čo riešiť ako prvé.

---

## Stránka 2: kvíz `/dotaznik`

```
Otázka 1 z 3
  „Než ti ukážem termíny, tri otázky."
  „Chodím k ženám osobne, tak si najprv overím, či ti viem pomôcť."
  -> pole: e-mail
  -> 🔴 kontakt sa zapíše do GHL HNEĎ po tomto kroku

Otázka 2 z 3
  „Čo doma riešiš?"
  -> Jednu miestnosť · Celý byt alebo dom · Už som zariaďovala a nesedí to · Neviem, kde začať

Otázka 3 z 3
  „Kedy to chceš riešiť?"
  -> Čo najskôr · Do pol roka · Zatiaľ len zisťujem
```

### Prečo tieto tri otázky

**E-mail prvý, a rámovaný ako kvalifikácia, nie ako zber kontaktov.** Lead je zachytený
hneď, ešte než padne cena. Rámovanie „overím si, či ti viem pomôcť" je pravdivé, lebo
Miriam naozaj cestuje na miesto, a zároveň dvíha jej status. Presne to robí eRevenue
svojím „Hľadám majiteľov, ktorí…".

**Otázka 2 predáva za nás.** Kto klikne „už som zariaďovala a nesedí to" alebo „neviem,
kde začať", si v tej sekunde pomenuje problém vlastnými prstami. Ďalšia obrazovka
je ponuka.

**Otázka 3 riadi dôraz na stránke s ponukou aj naliehavosť v sekvencii.**
„Čo najskôr" dostane kapacitu vpredu, „zatiaľ zisťujem" dostane najprv PDF a čas.

### 🔴 Odchýlka od playbooku: telefón až pri platbe

Playbook má telefón v treťom kroku kvízu. **Miriam výslovne povedala iba e-mail**, tak
je v kvíze iba e-mail. Pri platbe sa telefón aj adresa pýtať musia, lebo ide o osobnú
návštevu. V objednávkovom formulári ich žena dá rada, lebo už niečo kupuje.

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
| **Celý stack po položkách** | 90 minút u nej doma, analýza priestoru a potrieb, akčný plán priorít, „čo prestať kupovať" |
| **Bonus: PDF „5 najdrahších chýb"** | dostane ho hneď, nečaká na termín |
| **Cena 249 €** a hneď pod ňou **odpočet z projektu** | kto pokračuje, zaplatí za diagnostiku nakoniec nula |
| **Garancia, veľká a nad tlačidlom** | „Ak neodídeš s jasnom, povedz mi to na mieste a peniaze ti vrátim." |
| **Kotva hodnoty** | jej vlastná veta z webu: jedna zle umiestnená stena alebo zle kúpená sedačka stojí stovky až tisíce eur |
| **Kapacita: 9 miest mesačne** | pravdivá scarcity, musí sa strážiť |
| **Formulár s platobným prvkom** | meno, telefón, **adresa**, karta |

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
              tag diagnostika-lead      -> WF-A: PDF a nurture
              tag diagnostika-zaplatena -> WF-B: potvrdenie, PDF HNEĎ, príprava na stretnutie
              tag nekupila-ponuku       -> WF-C: PDF, potom námietky
```

### Tagy

| Tag | Kedy |
|---|---|
| `kviz-zacal` | po prvom kroku, kým sa kvíz nedokončí |
| `diagnostika-lead` | dokončený dotazník |
| `riesi-miestnost` · `riesi-cely-byt` · `uz-zariadovala` · `neviem-zacat` | otázka 2 |
| `kedy-teraz` · `kedy-polrok` · `kedy-zistujem` | otázka 3 |
| `diagnostika-zaplatena` | po úspešnej platbe |
| `nekupila-ponuku` | videla ponuku a nezaplatila |

⚠️ Staré tagy `checklist-developer`, `preberam-*` a `podklady-*` patrili k zrušenému
segmentu. **Nemazať** (house rule), ale nepoužívať a v žiadnom novom workflowe na ne
nespúšťať.

### Pipeline

Stavy už existujú, netreba nové:
`1 Lead → 2 Diagnostika rezervovaná → 3 Diagnostika zaplatená → 4 Diagnostika absolvovaná → 5 Ponuka projektu poslaná → 6 Projekt vyhraný`

⚠️ Keďže sa platí **pred** rezerváciou, kupujúca ide rovno do stavu **3**.
Stav 2 ostáva pre kontakty, ktoré prídu inou cestou (napríklad z jej hlavného webu).

### Minimum, ktoré musí byť napojené

| # | Vec | Stav |
|---|---|---|
| 1 | landing page a dotazník na novú bolesť | 🔴 stavia sa nanovo |
| 2 | kvíz zapisuje kontakt po **prvom** kroku | 🔴 |
| 3 | stránka `/ponuka` s platobným formulárom | 🔴 |
| 4 | presmerovanie na kalendár po platbe | 🔴 |
| 5 | okamžitý e-mail s PDF pre kupujúcu | 🔴 workflow čaká na prístupy do GHL |
| 6 | **notifikácia Miriam pri novom lede aj pri platbe** | 🔴 |
| 7 | kalendár „Interiérová diagnostika" | ✅ existuje, 🔴 ale bez notifikácií |
| 8 | pripomienky pred termínom | ✅ existujú (WF3) |
| 9 | vetva pre tých, čo nekúpili | 🔴 |
| 10 | PDF „5 najdrahších chýb" | ✅ existuje a je nahostované |
| 11 | pipeline so stavmi | ✅ existuje |

⚠️ **Nedokončené kvízy sú tiež leady.** Kto dá e-mail a odpadne pri druhej otázke, má
tag `kviz-zacal` a musí ho chytiť samostatná sekvencia. Inak je to zaplatený
a zahodený lead.

---

## Kde má lievik bývať

| | |
|---|---|
| Zrušené | `miriam-checklist.pages.dev`, patrilo k segmentu preberania bytu |
| **Nové** | **`diagnostika.miriamczompoly.sk`** |

🔴 **Reklama nesmie viesť na `pages.dev`.** Znižuje to dôveru, a keď sa na tej stránke
zadáva platobná karta, je to dvojnásobne dôležité.

⚠️ Jej hlavný web má už stránku `miriamczompoly.sk/diagnostika`. Lievik je **niečo iné**:
bez menu, bez únikov, s jedným CTA. Tie dve stránky sa nesmú zameniť ani prelinkovať.

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
| Vek | **30 až 60** |
| Pohlavie | ženy, zhodne s copy (⚠️ pod Advantage+ to Meta môže prekročiť, kvalifikuje text) |
| Záujmy | žiadne |
| Advantage+ publikum | zapnuté |
| Umiestnenia | Advantage+ |
| **Konverzná udalosť** | **Lead**, nie Purchase |
| **Merané pre biznis** | Purchase s hodnotou 249 €, ale neoptimalizuje sa naň |
| UTM | `utm_source=facebook&utm_medium=cpc&utm_campaign=diagnostika&utm_content={{ad.name}}` |
| Názvy reklám | `01_hook-otazka`, `02_hook-90minut`, … nech vieš, ktorý hook vyhral |

**Vek 30 až 60**, nie 28 až 50 ako pri predošlom segmente. Cieľovka už býva, už raz
zariaďovala a má na projekt rozpočet. To sú skôr tridsiatničky a štyridsiatničky
s vlastným bývaním, a horná hranica sa nemá kde zavrieť.

**Lokalita „bývajú tu"**, nie predvolené „bývajú alebo tu boli nedávno". Miriam
k žene fyzicky cestuje, takže turista v Trnave nie je cieľovka ani teoreticky.

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
✓ landing page a dotazník postavené na novú bolesť
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
✓ Miriam potvrdila 9 miest mesačne a vie ich ustrážiť
✓ Miriam potvrdila platbu pri rezervácii a garanciu vrátenia peňazí
```

⚠️ **Obchodné podmienky pribudli.** Predáva sa služba online, takže spotrebiteľské
povinnosti platia. Toto nie je voliteľné.

**Prvých 7 dní nezasahovať.** Algoritmus sa učí.

### Rozhodovací bod po 14 dňoch

Po zhruba 280 € minutých. Ak dovtedy prišli e-maily, ale **ani jedna predaná
diagnostika**, chyba nie je v cene, ale v tom, že stránka s ponukou nepredáva.
**Vtedy sa mení stránka, nie cena.** Až ak nepredá ani druhá verzia stránky,
mení sa ponuka.

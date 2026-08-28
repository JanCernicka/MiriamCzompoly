# Lievik: checklist pred preberaním bytu

Postavené podľa `playbook/04_funnel/`. Prečo práve tento segment a prečo je ponuka
zadarmo checklist a nie konzultácia, je v [`README.md`](README.md).

---

## Celý reťazec

```
Meta reklama (10+ videí, 1 copy, 20 €/deň)
        │
        ▼
/                     LANDING PAGE
        │             žiadne menu, všetky CTA vedú na /dotaznik
        ▼
/dotaznik             KVÍZ, tri obrazovky, jedna otázka na obrazovku
        │             1 z 3  e-mail      -> kontakt do GHL HNEĎ, tag kviz-zacal
        │             2 z 3  kedy preberá -> tag preberam-*
        │             3 z 3  podklady     -> tag podklady-*
        ▼
/dakujem              POĎAKOVANIE + ĎALŠÍ KROK
        │             segmentu „do 3 mesiacov" sa hneď ponúkne termín
        ▼
GoHighLevel           kontakt, tagy, dva workflowy
        │
        ▼
e-mail s checklistom  -> o 3 dni ponuka prejdenia výkresov -> platená služba
```

**Každý krok má jediný cieľ: dostať sa do ďalšieho kroku.**

---

## Prečo tri samostatné stránky

Na landing page sa dá odskrolovať a odísť. Na stránke s kvízom nie je nič iné, takže kto
naň klikne, má presne jednu vec, ktorú môže spraviť.

⚠️ **Súčasný stav sa od toho líši.** Živá stránka `miriam-checklist.pages.dev` má formulár
priamo v hero sekcii, teda je to jedna stránka, nie tri. Funguje, ale playbook aj overený
funnel `reforme.erevenue.cz` idú cestou troch stránok. **Pred spustením reklamy to treba
rozdeliť.**

---

## Stránka 1: landing page `/`

### Poradie sekcií

Prevzaté z `playbook/04_funnel/STRUKTURA_LANDING_PAGE.md`, sociálny dôkaz ide **pred**
„o mne", lebo človek prichádza z reklamy nedôverčivý.

| # | Sekcia | Čo tam je |
|---|---|---|
| 0 | **Hero** | „Kým podpíšeš preberací protokol" + čo je v checkliste + prvé CTA |
| 1 | **Sociálny dôkaz** | ⚠️ len ak má reálne recenzie. Inak sekciu vynechať, nie vymyslieť. |
| 2 | **Prečo to riešiť teraz** | uzávierka klientských zmien, tri konkrétne príklady |
| 3 | **Kto som** | tvár za tým, od roku 2010, chodí na obhliadky pred preberaním |
| 4 | **Námietka: „to mi povie developer"** | povie, ale až keď sa spýtaš, a niektoré veci už nepovie vôbec |
| 5 | **Námietka: „mám ešte čas"** | uzávierka býva mesiace pred odovzdaním |
| 6 | **Čo je vnútri** | obsah checklistu po fázach |
| 7 | **CTA** | „Chcem checklist" |

### Pravidlá

- 🔴 **Žiadne menu, žiadny odkaz na hlavný web, žiadne sociálne siete.**
  V analyzovaných funneloch nebol ani jeden odkaz na sociálne siete.
- Všetky tlačidlá vedú na `/dotaznik`. Text sa môže líšiť, cieľ nie.
- Nad záhybom musí byť vidieť to, čo sľúbila reklama: **checklist zadarmo**.

### Meta description

Hovorí o probléme, nie o firme:

> Väčšina vecí, ktoré ťa v novom byte budú štvať, sa rozhoduje mesiace pred preberaním.
> Toto je zoznam, čo si vypýtať a kedy.

---

## Stránka 2: kvíz `/dotaznik`

```
Otázka 1 z 3
  „Než začneme, napíš mi svoj e-mail."
  „Na tento e-mail ti pošlem checklist."
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

**E-mail prvý a s vysvetlením prečo.** Lead je zachytený hneď, aj keď kvíz nedokončí.
Rámovanie „pošlem ti checklist" nevyzerá ako zber kontaktov, ale ako podmienka doručenia.

**Otázka 2 je segmentácia**, ktorá riadi druhý workflow. Kto preberá do 3 mesiacov, dostane
o tri dni ponuku platenej služby. Ostatní nie.

**Otázka 3 kvalifikuje na platenú službu** a zároveň robí prácu za copy: kto klikne
„neviem, čo mám mať", si v tej sekunde uvedomí, že problém má. To je presne tá bolesť,
ktorú checklist rieši.

### 🔴 Odchýlka od playbooku: telefón nezbierame

Playbook má v treťom kroku telefón. **Miriam výslovne povedala e-mail, nie telefón**,
tak je to tak. Dôsledky, s ktorými treba počítať:

- follow-up ide len e-mailom, žiadna SMS
- v žiadnom e-maile nesmie byť `{{contact.first_name}}`, meno tiež nezbierame, vyrenderovalo
  by sa „Ahoj ,"
- ak sa neskôr ukáže, že e-mail nestačí, telefón sa dá pridať ako **nepovinné** pole
  na stránku s poďakovaním, nie do kvízu

### Pravidlá

- maximálne tri kroky, viac znamená odpad
- jedna otázka na obrazovku
- posledný krok: „Odoslaním potvrdzuješ…" a checkbox na novinky (GDPR)

---

## Stránka 3: poďakovanie `/dakujem`

Nenechať človeka čakať. Podľa segmentu z otázky 2:

| Segment | Čo vidí |
|---|---|
| **Do 3 mesiacov** | „Checklist je na ceste. A ešte niečo…" + **rovno kalendár** na prejdenie výkresov |
| Do roka · Neviem · Už bývam | „Checklist je na ceste, pozri aj Promo a Spam." Žiadny ďalší tlak. |

Segmentu do 3 mesiacov sa termín ponúka **hneď**, nie až o tri dni e-mailom. E-mail o tri
dni ostáva ako druhý pokus pre tých, čo hneď neklikli.

---

## Napojenie na GoHighLevel

Technické „ako" je v `lievik-checklist/`. Tu je „čo a prečo".

```
kvíz -> Cloudflare Pages Function -> POST /contacts/upsert -> kontakt + tagy
                                          │
                        tag `checklist-developer` -> WF-A: checklist hneď
                        tag `preberam-do-3m`      -> WF-B: o 3 dni ponuka
```

### Tagy

| Tag | Kedy |
|---|---|
| `checklist-developer` | každý, kto dokončí prvý krok |
| `preberam-do-3m` · `preberam-do-roka` · `preberam-neviem` · `uz-byvam` | otázka 2 |
| `podklady-mam` · `podklady-ciastocne` · `podklady-nemam` · `podklady-neviem` | otázka 3 |
| `kviz-zacal` | po prvom kroku, kým sa kvíz nedokončí |

### Minimum, ktoré musí byť napojené

| # | Vec | Stav |
|---|---|---|
| 1 | kvíz zapisuje kontakt po **prvom** kroku | 🔨 treba dorobiť, teraz sa zapisuje až na konci |
| 2 | okamžitý e-mail s checklistom | 🔴 workflow čaká na prístupy |
| 3 | **notifikácia Miriam pri novom lede** | 🔴 chýba, treba doplniť do WF-A |
| 4 | kalendár na rezerváciu | ✅ existuje (Interiérová diagnostika) |
| 5 | pripomienky pred termínom | ✅ existujú (WF3) |
| 6 | follow-up pre tých, čo si termín nevybrali | 🔴 WF-B |
| 7 | pipeline so stavmi | ✅ existuje |

⚠️ **Nedokončené kvízy sú tiež leady.** Kto dá e-mail a odpadne pri druhej otázke, má tag
`kviz-zacal` a musí ho chytiť samostatná sekvencia. Inak je to zaplatený a zahodený lead.

---

## Kde má lievik bývať

| | |
|---|---|
| Teraz | `miriam-checklist.pages.dev` |
| **Pred spustením reklamy** | **`checklist.miriamczompoly.sk`** |

🔴 **Reklama nesmie viesť na `pages.dev`.** Znižuje to dôveru a klientka si nebuduje vlastný
majetok. Odporúčané názvy subdomén podľa playbooku: `checklist.` · `ponuka.` · `reklama.`

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
| Konverzná udalosť | Lead |
| UTM | `utm_source=facebook&utm_medium=cpc&utm_campaign=checklist&utm_content={{ad.name}}` |
| Názvy reklám | `01_hook-otazka`, `02_hook-lokalita`, … nech vieš, ktorý hook vyhral |

Lokalita je nastavená na **„bývajú tu"**, nie na predvolené „bývajú alebo tu boli nedávno".
Turista v Trnave si prerobenie bytu nekúpi ani teoreticky.

### Checklist pred zapnutím

```
✓ landing page rozdelená na tri stránky
✓ kvíz zapisuje kontakt po prvom kroku
✓ workflowy publikované a otestované reálnym odoslaním
✓ Miriam dostane notifikáciu o novom lede
✓ vlastná subdoména, nie pages.dev
✓ pixel nasadený, udalosť Lead sa páli, overené v Events Manageri
✓ cookie consent a ochrana osobných údajov
✓ 10+ videí nahratých
✓ všetky tvrdenia v copy potvrdené Miriam
✓ scarcity sedí s reálnou kapacitou
```

**Prvých 7 dní nezasahovať.** Algoritmus sa učí.

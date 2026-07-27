# Revízia 3 — referral odmena + mechanika „odpíš a niečo sa stane"

---

## 1. Referral odmena — nasadené

| kto | dostane | kedy |
|--|--|--|
| **Odporúčaná (nová)** | **250 € zľava** na Kompletnú premenu domova alebo Na kľúč | pri objednaní projektu |
| **Odporúčajúca** | **60 min sezónny refresh** u nej doma (dekor, textílie, svetlo) | až keď sa odporúčaná pustí do projektu |

**Zmenené naživo:** E15 (predmet + telo) a S6 vo WF6. Custom value premenovaná `Referral kredit` → **`Referral odmena`**.

**Čo z copy zmizlo:** *„venujem jej Interiérovú diagnostiku (v hodnote 249 €) zadarmo"*. To bol pozostatok starej ponuky a búral platený filter, na ktorom stojí celý reframe. Odporúčaná teraz dostáva **zľavu z projektu**, nie diagnostiku zadarmo.

**Prečo odmena až pri projekte:** odmena sa vypláca z príjmu, nie dopredu. 60 min času pri projekte od 3 900 € je zanedbateľný náklad a zároveň to prirodzene filtruje — nikto nebude posielať mená naslepo.

---

## 2. „Odpíš a niečo sa stane" — čo je manuál a čo automat

**Tvoja otázka bola správna.** Máš pravdu, že v marketingu „napíš XYZ" väčšinou znamená automat. Preto som prešiel všetkých 5 výziev a overil, či niektorá **sľubuje** automatickú reakciu.

> ⚠️ **KOREKCIA:** prvá verzia tohto zoznamu bola neúplná. Moje vyhľadávanie hľadalo slovesá („odpíš", „napíš rovno") a **prehliadlo kľúčové slová v úvodzovkách**. Ty si si ich všimol. Sú tri a sú to presne tá automatizačná konvencia, o ktorej si písal.

### Kompletný zoznam (opravený)

**Otvorené pozvánky na rozhovor — manuál:**
| kde | text |
|--|--|
| E1 | „stačí odpísať na tento e-mail, čítam každú správu" |
| E5 | „pokojne mi odpíš, kde doma sa najviac trápiš a poradím" |
| E9 | „ak by ti termín nevyšiel, stačí odpísať a nájdeme iný" |
| E15 | „stačí odpovedať s jej menom a číslom" |
| E16 | „ak niečo nebolo ideálne, napíš rovno mne" |

**Kľúčové slová — TIETO automat mať majú:**
| kde | text | sľub |
|--|--|--|
| **S2** (reaktivácia) | Napíš **„hej"** | „mám pre teba nový rýchly formát" |
| **E7** (reaktivácia) | napíšeš **„mám záujem"** | „ozvem sa ti" |
| **E10** (po diagnostike) | Odpíš **„idem do toho"** | pôvodne „pošlem ti dohodu a ďalší krok" |

Kľúčové slovo v úvodzovkách nastavuje očakávanie **okamžitej reakcie**. Ak človek napíše „idem do toho" a tri hodiny sa nič nedeje, stráca dôveru presne v momente najvyššej intencie.

### Prečo majú ostať manuálne
Každá z tých piatich pýta niečo, čo **stroj nevie spraviť bez toho, aby klamal**:
- E5 sľubuje **radu na mieru** k jej konkrétnemu priestoru
- E9 rieši **presun termínu** v jej reálnom kalendári
- E15 pýta **meno a číslo kamarátky** — to treba spracovať človekom
- E16 je zámerný **ventil pre nespokojnosť** — automat tu je najhoršia možná odpoveď

Pri E1 je to navyše zámer: **odpoveď na e-mail zlepšuje doručiteľnosť** celej domény. Chceme, aby ľudia odpisovali.

Zvlášť dôležité pri **E6 (9-word e-mail)** v reaktivácii: celý zmysel Hormoziho 9-word e-mailu je, že vyzerá ako osobná správa a **naštartuje ľudský rozhovor**. Automatická odpoveď by ho zabila.

### Čo BY malo byť automatizované, a teraz je
Automatizovať sa má **inštalatérska práca okolo odpovede**, nie odpoveď samotná:

```
WF0 — Odpoveď = STOP sekvencií        (trigger: customer_replied)
   ├─ Vyradiť z WF1 · WF2 · WF4 · WF5 · WF6 · WF7
   ├─ Tag: odpovedala
   └─ 📧 Upozorniť Miriam  ← nové
        „Kontakt {{contact.name}} práve odpovedal.
         Sekvencie sú zastavené, ďalší krok je na tebe.
         E-mail: … Telefón: …"
```

Predtým: človek odpísal, **nikto sa to nedozvedel** a stroj mu poslal ďalší automat.
Teraz: sekvencie sa zastavia, Miriam dostane e-mail s kontaktom, konverzáciu preberá človek.

**WF3 zámerne NIE je v zozname na vyradenie.** Ak niekto odpíše „ďakujem", nechceme mu zrušiť pripomienky pred termínom. Notifikácia príde tak či tak.

---

## 3. WF8 — automat na kľúčové slová (nasadené)

**Overené, že to ide:** trigger `customer_replied` prijme a **uloží** podmienku `message.body contains "…"`.
_(Prvý pokus mi ukázal `conditions: null` — čítal som cez zlý endpoint. Cez `read_triggers` sú podmienky uložené správne.)_

```
WF8 — Kľúčová odpoveď = horúci lead
   Triggery (3):  odpoveď obsahuje „hej" · „mám záujem" · „idem do toho"
      ├─ Tag: horuci-lead
      ├─ 📧 Okamžité potvrdenie kontaktu
      │     „Super, mám to. Ozvem sa ti osobne do 24 hodín.
      │      Ak to chceš rozbehnúť hneď, vyber si termín: [kalendár]"
      └─ 🔥 Upozorniť Miriam („HORÚCI LEAD, ozvi sa čo najskôr")
```

**Zosúladený sľub v E10:** *„pošlem ti dohodu a ďalší krok"* → **„ozvem sa ti do 24 hodín s dohodou a ďalšími krokmi"**.
Dôvod: dohoda je reálny dokument, ktorý musí spraviť Miriam. Automat ho poslať nevie, takže by sme klamali. Automat teraz dodá to, čo dodať vie: **okamžité potvrdenie + odkaz na kalendár**, a nastaví reálne očakávanie 24 hodín.

**Poznámka:** pri kľúčovej odpovedi sa spustí WF0 aj WF8, takže Miriam dostane dva e-maily (jeden generický, jeden 🔥). Nechal som to tak zámerne — pri horúcom leade je lepšie upozorniť dvakrát než ho prehliadnuť.

### Čo ešte zvážiť
**Odpoveď „STOP" / „ODHLÁSIŤ" → automatické odhlásenie.** Hygiena a ochrana domény. Postaviteľné rovnakým vzorom.

⚠️ **Runtime overenie:** podmienky sa uložili, ale **či ich GHL naozaj vyhodnocuje pri doručení správy, som otestovať nevedel** (vyžadovalo by to poslať reálnu odpoveď na publikovaný workflow). Pri go-live to treba overiť jedným testovacím kontaktom.

---

## Stav WF0 po doplnení
| krok | typ |
|--|--|
| Vyradiť z WF1 · WF2 · WF4 · WF5 · WF6 · WF7 | `remove_from_workflow` |
| Tag: odpovedala | `add_contact_tag` |
| Upozorniť Miriam | `internal_notification` |

Bez poistky 2 min — zámerne, stop musí zabrať okamžite.

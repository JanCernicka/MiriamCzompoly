# KROK 6D — E-MAILY a SMS: presné znenie každej správy

_Hotový text na vloženie do workflowov (viď step6e). Merge fields GHL: `{{contact.first_name}}`, `{{location.phone}}`, `{{location.name}}`. Každá správa má ID (E# / S#) — workflowy sa naň odkazujú. Tón: tykanie, ženský avatar, teplo + priamo (ako jej existujúca copy)._

Odosielateľ e-mailov: **Miriam Czompoly · dizajn@miriamczompoly.sk**

---
## SEKVENCIA A — Lead magnet + nurture (spustí opt-in „5 chýb“)
Cieľ: dodať e-book → dať hodnotu → predať diagnostiku 249 €.

### E1 — okamžite (dodanie)
**Predmet:** Tu je tvojich 5 najdrahších chýb 📩
**Telo:**
Ahoj `{{contact.first_name}}`,
tu je, čo si si pýtala — **5 najdrahších chýb, ktoré ľudia robia vo svojom byte**: [ODKAZ NA PDF]
Prejdi si to v pokoji. Väčšina žien sa v bode 2 spozná okamžite 🙂
Ak by ti niečo nebolo jasné, stačí odpísať na tento e-mail — čítam každú správu.
Miriam

### E2 — +1 deň (hodnota, príbeh)
**Predmet:** Toto vidím skoro v každom byte
**Telo:**
`{{contact.first_name}}`, keď prídem k niekomu domov, 9 z 10 bytov má ten istý problém: nábytok je „polepený“ o steny a miestnosť nemá centrum. Vyzerá to „upratane“, ale priestor nefunguje a pôsobí chladne.
Skús jednu vec: postav sa do dverí každej miestnosti a opýtaj sa — *kam ma priestor prirodzene vedie?* Ak odpoveď nie je jasná, dispozícia pracuje proti tebe.
Zajtra ti napíšem, čo s tým (a čo NEkupovať, kým to nevyriešiš).
Miriam

### E3 — +3 dni (hodnota + jemný ask)
**Predmet:** Čo prestať kupovať (ušetríš stovky)
**Telo:**
`{{contact.first_name}}`, najdrahšie chyby nevznikajú pri veľkých veciach, ale pri „malých“ nákupoch, ktoré k sebe nesedia — koberec sem, lampa tam, doplnky z akcie. Po pol roku máš plný byt vecí a stále to „nie je ono“.
Riešenie nie je kupovať viac. Je to plán. Presne to robíme na **Interiérovej diagnostike**: za 90 minút u teba doma pomenujeme priority a povieme si, čo prestať kupovať.
Ak ťa to zaujíma, tu je viac: [ODKAZ /diagnostika]
Miriam

### E4 — +5 dní (dôkaz / case study)  `[B: doplniť pred/po]`
**Predmet:** „Nikdy by mi to nenapadlo“
**Telo:**
`{{contact.first_name}}`, u rodiny Dimovej sme nezačali nákupom, ale posunutím zopár vecí a jednou zmenou dispozície. Výsledok? Priestor, ktorý konečne dýcha. [pred/po foto]
Presne toto je zmysel diagnostiky — najprv jasný plán, až potom peniaze.
Chceš, aby som sa pozrela na tvoj priestor? [ODKAZ /diagnostika]
Miriam

### E5 — +8 dní (priama ponuka + scarcity)
**Predmet:** Beriem 3–4 projekty mesačne
**Telo:**
`{{contact.first_name}}`, aby som každej klientke dala čas, beriem iba 3–4 kompletné projekty mesačne. Diagnostika (249 €) je prvý krok a celú sumu ti odpočítam, ak budeme pokračovať.
Ak cítiš, že je čas prestať míňať naslepo: [ODKAZ /diagnostika]
A ak ešte nie, pokojne mi odpíš, kde v byte sa najviac trápiš — poradím.
Miriam

### S1 — SMS +2 dni po E1 (len ak máme telefón)
Ahoj `{{contact.first_name}}`, tu Miriam 🙂 dostala si e-book o 5 chybách? Ak chceš, pozriem tvoj priestor osobne na diagnostike — celá suma sa odpočíta z projektu: [odkaz]

---
## SEKVENCIA B — Reaktivácia databázy (84 kontaktov + minulí klienti)
Cieľ: oживiť staré kontakty najlacnejším spôsobom. Klasický 9-word email.

### E6 — deň 0 (9-word email, BEZ obrázkov a odkazov)
**Predmet:** rýchla otázka
**Telo:**
Ahoj `{{contact.first_name}}`, riešiš ešte stále svoj interiér?

### E7 — +3 dni ak neodpovedala
**Predmet:** ešte stále to máš v hlave?
**Telo:**
`{{contact.first_name}}`, ak áno, spravila som niečo nové — Interiérovú diagnostiku na mieste (90 min u teba doma, jasný plán priorít). Prvý koncept vidíš do 7 dní. Ozvem sa ti, ak napíšeš „mám záujem“. Miriam

### E8 — +6 dní ak stále nič (hodnota + ukončenie)
**Predmet:** posledný tip odo mňa
**Telo:**
`{{contact.first_name}}`, aj keby sme nespolupracovali — jedna vec, ktorá zmení každú miestnosť: presuň nábytok od stien a vytvor jedno jasné centrum. Keby si chcela pomôcť s celkom, som tu: [ODKAZ /diagnostika]. Miriam

### S2 — SMS +1 deň po E6 (ak je telefón a neodpovedala na e-mail)
Ahoj `{{contact.first_name}}`, tu Miriam 🙂 riešiš ešte svoj interiér? Ak hej, mám pre teba nový rýchly formát. Napíš „hej“.

---
## SEKVENCIA C — Pred diagnostikou (spustí rezervácia termínu)
Cieľ: znížiť no-show, pripraviť klientku.

### E9 — okamžite po rezervácii (potvrdenie)
**Predmet:** Potvrdené — teším sa na `{{appointment.start_time}}` 🙂
**Telo:**
Ahoj `{{contact.first_name}}`,
tvoj termín Interiérovej diagnostiky je potvrdený: **`{{appointment.start_time}}`**, u teba na adrese `{{contact.address1}}`.
Aby sme čas využili naplno, priprav si:
- fotky priestoru (aj „neupratané“ — potrebujem realitu),
- pôdorys, ak ho máš (nevadí, ak nie),
- 2–3 inšpirácie, ktoré sa ti páčia (Pinterest, časopis…),
- otázky, ktoré ťa najviac trápia.
Ak by si potrebovala termín presunúť, stačí odpísať.
Miriam · `{{location.phone}}`

### S3 — 1 deň pred termínom
Ahoj `{{contact.first_name}}`, pripomínam našu diagnostiku zajtra o `{{appointment.start_time}}`. Priprav si fotky a pár inšpirácií 🙂 Teším sa! Miriam

### S4 — 2 hodiny pred termínom
`{{contact.first_name}}`, o 2 h sme dohodnuté (`{{appointment.start_time}}`). Ak by čokoľvek, volaj `{{location.phone}}`. Miriam

---
## SEKVENCIA D — Po diagnostike → ponuka projektu (spustí dokončenie diagnostiky)
Cieľ: premeniť platenú diagnostiku na projekt.

### E10 — okamžite po diagnostike (zhrnutie + ponuka)
**Predmet:** Tvoj plán + ako pokračujeme
**Telo:**
Ahoj `{{contact.first_name}}`, ďakujem za dnešok — bavilo ma to!
Ako sme si povedali, tvoje priority sú: [1] … [2] … [3] … (Miriam doplní / alebo generický text: „poslala som ti hlavné body do poznámok“).
Ak chceš, aby som ti pripravila kompletný návrh, tu je, ako to funguje:
- **Miestnosť, ktorá funguje** — od 1 090 €
- **Kompletná premena domova** — od 3 900 € (obe garancie v cene)
- Diagnostiku (249 €) ti z ceny projektu **odpočítam**.
Prvý hrubý koncept vidíš **do 7 dní** od potvrdenia. Beriem 3–4 projekty mesačne — ak chceš svoj termín, daj mi vedieť.
Odpíš „idem do toho“ a pošlem ti dohodu a ďalší krok.
Miriam

### E11 — +2 dni ak neodpovedala (garancia)
**Predmet:** Aby si sa nemusela báť
**Telo:**
`{{contact.first_name}}`, viem, že prerábka je rozhodnutie. Preto beriem riziko na seba:
**Garancia tvojho štýlu** — ak návrh nebude „ty“, prepracujem ho zdarma.
**Garancia funkčného priestoru** — pracujem, kým priestor nefunguje tak, ako sme si dohodli.
Nemáš čo stratiť, len priestor, ktorý ťa štve. Ideme? [ODKAZ / kontakt]
Miriam

### E12 — +4 dni (case study + scarcity)
**Predmet:** Ešte mám 1 voľné miesto tento mesiac
**Telo:**
`{{contact.first_name}}`, tento mesiac mi ostáva posledné voľné miesto na kompletný projekt. Keď ho zaplním, ďalší termín je až [ďalší mesiac].
Ak to chceš rozbehnúť teraz (a mať prvý koncept do 7 dní), napíš mi dnes. Ak radšej menší krok, vieme začať jednou miestnosťou (od 1 090 €).
Miriam

### E13 — +7 dní (down-sell / mäkké ukončenie)
**Predmet:** Necháme to na neskôr?
**Telo:**
`{{contact.first_name}}`, ak teraz nie je ten správny čas, chápem. Nič sa nedeje — tvoj plán z diagnostiky ti ostáva. Keď budeš pripravená (aj o pár mesiacov), ozvi sa a nadviažeme. A keby si chcela najprv len jednu miestnosť, som tu. Miriam

---
## SEKVENCIA E — No-show / zrušená diagnostika
### E14 — okamžite pri no-show
**Predmet:** Nestihli sme sa — dáme nový termín?
**Telo:**
Ahoj `{{contact.first_name}}`, dnes sme sa minuli 🙂 Stáva sa. Vyber si nový termín tu: [ODKAZ kalendár]. Teším sa! Miriam
### S5 — +1 h po no-show
`{{contact.first_name}}`, škoda že sme sa dnes nestretli. Nový termín: [odkaz]. Miriam

---
## SEKVENCIA F — Referral (spustí dokončený projekt alebo pozitívna recenzia)
### E15 — po dokončení projektu / pozitívnej recenzii
**Predmet:** Darček pre tvoju kamarátku (a pre teba) 🎁
**Telo:**
`{{contact.first_name}}`, ďakujem za dôveru — bola to radosť!
Ak poznáš niekoho, kto sa vo svojom byte trápi rovnako, ako si sa trápila ty: pošli mi jej meno a ja jej venujem **Interiérovú diagnostiku (v hodnote 249 €) zadarmo**. A keď sa rozhodne pre projekt, **ty dostaneš 100 € kredit** (alebo darček podľa dohody).
Stačí odpovedať na tento e-mail s jej menom a číslom — alebo nás rovno spojiť v správe. Miriam
### S6 — +3 dni ak neodpovedala
`{{contact.first_name}}`, platí tá diagnostika zdarma pre tvoju kamarátku (a 100 € kredit pre teba) 🙂 Máš niekoho na mysli? Miriam

---
## SEKVENCIA G — Žiadosť o recenziu (napojiť na existujúce workflowy 1–3)
### S7 — +2 dni po dokončení projektu
Ahoj `{{contact.first_name}}`, veľmi by mi pomohlo, keby si napísala pár slov o našej spolupráci 🙏 Zaberie to minútku: [ODKAZ Google recenzia]. Ďakujem! Miriam
### E16 — +2 dni po S7 ak neklikla
**Predmet:** Pomôžeš mi jednou vetou?
**Telo:**
`{{contact.first_name}}`, ak si s premenou spokojná, tvoja krátka recenzia pomôže ďalšej žene rozhodnúť sa: [ODKAZ]. A ak niečo nebolo ideálne, napíš rovno mne — chcem to napraviť. Ďakujem, Miriam

---
## Rozdelenie
**[A] Ja:** všetok text hotový; vložím do workflowov a spojím s logikou (step6e).
**[B] Vy/klientka:** doplniť odkazy (PDF e-booku, /diagnostika, Google recenzia), pred/po fotky do E4, a odsúhlasiť výšku referral incentívy (100 € kredit / darček). Miriam v E10 dopĺňa 3 konkrétne priority klientky (alebo použijeme generickú verziu).

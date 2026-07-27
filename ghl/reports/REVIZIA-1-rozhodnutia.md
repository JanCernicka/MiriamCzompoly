# Revízia 1 — odpovede na 12 pripomienok

_Každý bod overený voči `step5-books-framework.md` (Hormozi) a živému stavu účtu. Kde nemáš pravdu, píšem to priamo._

---

## 1. Lead magnet: len e-mail, žiadne meno, žiadne SMS ✅ MÁŠ PRAVDU

**Overené:** formulár `geA4rea…` zbiera `first_name` + `email`, **telefón nezbiera vôbec**. SMS krok S1 vo WF1 by teda **nikdy nezbehol** — posielal by sa na prázdne číslo. Bola to moja chyba.

**Spravené:**
- S1 z WF1 odstránená
- `{{contact.first_name}}` odstránené zo všetkých mailov WF1

**Prečo to musí ísť spolu:** ak by sme zrušili pole „meno" a nechali merge tag, e-mail by začínal „Ahoj ," — horšie než bez mena. Tvoj návrh je konzistentný.

**Kde som nechal mená:** WF2 (84 kontaktov z DB), WF3–WF7 (rezervácia/klientky). Tam mená reálne máme a personalizácia je zadarmo.

🟠 **Ostáva:** odstrániť pole „meno" z formulára. Menej polí = vyšší opt-in, čo pri 10 €/deň rozhoduje.

---

## 2. „Odpíš a niečo sa stane" — manuál či automat? ⚠️ BOLA TO DIERA

**Odpoveď:** boli myslené **manuálne** (Miriam odpisuje). Ale nič ju o odpovedi neupozorňovalo a **sekvencia bežala ďalej** — človek odpísal a stroj mu poslal ďalší automat. To je zlé.

Nechávam ich, lebo odpoveď je najsilnejší signál záujmu a zvyšuje doručiteľnosť. Ale doplnil som mechaniku (viď bod 8).

---

## 3. WF3: SMS potvrdenie + čakanie na odpoveď + notifikácia 🟡 ČIASTOČNE

Súhlas s SMS potvrdením (SMS má ~98 % otvorenosť, pri 249 € návšteve doma to znižuje no-show).

**Ale nesúhlasím s „opýtať sa, či sedí deň a čas".** Vygeneruje to odpoveď pri **každej** rezervácii, teda prácu navyše aj tam, kde je všetko v poriadku. Lepšie je potvrdiť a dať možnosť ozvať sa: *„ak by ti termín nevyhovoval, napíš."* Rovnaká poistka, zlomok práce.

Notifikáciu Miriam pri odpovedi rieši WF0 (bod 8).

🟠 **Ostáva:** pridať SMS potvrdenie do WF3.

---

## 4. Spúšťať cez pipeline stage namiesto tagov ✅ MÁŠ PRAVDU, ale nie všade

Máš pravdu v podstate: presunúť kartu myšou je jedna akcia, je vidno stav, a Miriam nemusí vedieť o skrytých tagoch.

**Prepnuté na `pipeline_stage_updated`:**
| WF | stage |
|--|--|
| WF4 po diagnostike | Diagnostika absolvovaná |
| WF6 referral | Recenzia / Referral |

**Zámerne NEPREPNUTÉ (a prečo):**
- **WF1** — spúšťa odoslanie formulára. Opt-in nie je pohyb v pipeline.
- **WF3** — spúšťa rezervácia termínu. Deje sa automaticky, Miriam pri tom nie je.
- **WF2** — hromadná reaktivácia 84 kontaktov naraz. Ťahať 84 kariet myšou nedáva zmysel.
- **WF5 no-show** — v pipeline **nie je stage pre no-show**. Buď pridáme stage, alebo ostáva tag. Povedz ktoré.
- **WF7 recenzie** — sedel by na ten istý stage ako WF6. Obe naraz = klientka dostane naraz prosbu o recenziu aj o odporúčanie. Nechal som tag, aby si ich vedela spustiť oddelene.

---

## 5. Poistka „počkaj 1 minútu" na začiatku ✅ SPRAVENÉ

Pridané do **všetkých 7** sekvencií. Ak Miriam pretiahne kartu omylom a hneď to opraví, nič sa neodošle.

_Poznámka: 1 minúta je dosť tesná. 5 minút by dalo väčšiu rezervu. Ak chceš, prehodím._

Výnimka: **WF0 poistku nemá zámerne** — je to stop-mechanizmus, musí zabrať okamžite.

---

## 6. from_name / from_email ✅ SPRAVENÉ

Vďaka za ukážku v E10 — GHL používa **snake_case** (`from_name`, `from_email`), nie camelCase. Preto sa moje pôvodné `fromName` nikde neprejavilo.

Nastavené na **všetkých 16 e-mailových krokoch**: `Miriam Czompoly` / `{{location.email}}`.

---

## 7. Scarcity 1–2 namiesto 3–4 ✅ SPRAVENÉ, s podmienkou

Hormozi (A9): scarcity musí byť **honest scarcity**. Nie je to páka na klamanie, je to pomenovanie reálnej kapacity.

Tvoj argument sedí aj ekonomicky: 2 × 3 900 € ≈ 7 800 €/mesiac je zdravý cieľ a nižšie číslo zvyšuje vnímanú exkluzivitu.

Zmenené na **„1–2 kompletné projekty mesačne"**. Pridal som slovo *kompletné*, lebo diagnostík zvláda viac, a tvrdiť „beriem 1–2 klientky" by bolo nepravdivé.

⚠️ **Musí to sedieť s realitou.** Ak reálne zvláda 3, vráťme 3.

---

## 8. Zastaviť sekvenciu, keď človek odpovie ✅ MÁŠ PRAVDU + viem prečo ti to nefungovalo

Toto bola najväčšia diera. **Postavil som `WF0 – Odpoveď = STOP sekvencií`:**

```
Trigger: kontakt odpovedal (customer_replied)
   └─ Vyradiť z WF1 · WF2 · WF4 · WF5 · WF6 · WF7
        └─ Tag: odpovedala
```

**Prečo tvoj pôvodný prístup nefungoval:** vetvenie „if replied / if not replied" na **každom kroku** je krehké. Každý e-mail potrebuje vlastnú vetvu, vetvy sa musia znova spájať, a stačí jedna zle napojená a kontakt vypadne alebo dostane obe vetvy. Preto to padalo.

**Správny vzor je jeden globálny „kill switch"** mimo sekvencií. Jeden workflow, jedno miesto na údržbu, pokrýva všetky sekvencie naraz. Tvoj inštinkt bol správny, len umiestnenie.

🟠 **Ostáva:** doplniť do WF0 notifikáciu pre Miriam (akcia `send_internal_notification` potrebuje presnú schému, ešte ju ladím).

---

## 9. No-show: e-mail a SMS naraz ✅ SPRAVENÉ

Zrušené hodinové čakanie. Pri no-show je oneskorenie čistá strata — človek je práve teraz pri telefóne a vie, že nedorazil.

---

## 10. Referral hneď, nie po 2 dňoch ✅ SPRAVENÉ

Zrušené 2-dňové čakanie pred E15. Ostáva len minútová poistka. Máš pravdu: keď Miriam kartu presunie, sama tým hovorí, že moment nastal.

_3-dňové čakanie pred pripomienkovou SMS som nechal, to je iný účel._

---

## 11. Byty vs domy 🟡 MÁŠ PRAVDU, ale nie všade

**Overené v copy:**
| dokument | „byt" | „dom/domov" |
|--|--|--|
| web | 8× | **19×** |
| e-maily | 8× | 5× |
| reklamy | 7× | 3× |

Web je už prevažne o „domove". Problém je koncentrovaný v **názve lead magnetu a v reklamách**.

**Overené v jej portfóliu** (media library): chalupy, rodinné domy (Karlovice, Limbach), aj komerčné priestory (kaderníctvo, reštaurácia). **Skúsenosti s domami reálne má.**

Súhlasím, že „byt" zbytočne zužuje a môže pôsobiť lacnejšie. Nesúhlasím ale, že v bytoch bývajú chudobnejší — 3-izbový byt v Trnave nie je znak nízkeho príjmu. Silnejší argument je iný: **dom = väčšia plocha = väčší projekt = vyšší ticket.**

**Návrh:** prepísať na *„5 najdrahších chýb, ktoré ľudia robia pri zariaďovaní domova"*. Pokryje byt aj dom.

⚠️ **Dopad:** PDF (regenerovať), názov formulára, texty na webe, 3 reklamné kreatívy (v Mete nemenné → znova vytvoriť). Zvládnem, ale je to zásah naprieč. **Poviem áno/nie?**

---

## 12. Referral odmena ✅ MÁŠ PRAVDU, moja bola zlá

100 € **kredit** pre niekoho, kto má práve po prerábke, je bezcenný. Nemá ho kde minúť. Bola to chyba.

**Čo hovorí kniha (B10):** *„one/two-sided incentíva — zaplať svoj CAC referrerovi alebo priateľovi."* Teda odmena má byť **reálna hodnota**, nie interný kredit, a **obojstranná**.

**Návrh:**
| komu | čo | prečo |
|--|--|--|
| **Ten, kto odporučí** | 100 € darčeková karta (alebo hotovosť) — vyplatená až keď kamarátka zaplatí diagnostiku | reálna hodnota, nie kredit; platí sa až z príjmu |
| **Nová klientka** | 100 € zľava z projektu | nie diagnostika zadarmo |

**Prečo NIE diagnostika zadarmo:** celý reframe stojí na tom, že diagnostika je **platený filter kvality**. Rozdávať ju zadarmo by zbúralo to hlavné, čo sme opravili. Súhlasím s tebou.

100 € pri projekte od 3 900 € je ~2,5 % CAC. To je veľmi lacná akvizícia.

🟠 **Ostáva:** prepísať E15/S6 na obojstrannú odmenu (čaká na tvoje odsúhlasenie sumy).

---

## Stav workflowov po revízii

| WF | trigger | poistka 1 min | from_name | mená |
|--|--|--|--|--|
| **WF0** STOP | odpoveď kontaktu | zámerne nie | — | — |
| WF1 lead magnet | odoslanie formulára | ✅ | ✅ | bez mien |
| WF2 reaktivácia | tag | ✅ | ✅ | s menami |
| WF3 pred diagnostikou | rezervácia termínu | ✅ | ✅ | s menami |
| WF4 po diagnostike | **pipeline stage** | ✅ | ✅ | s menami |
| WF5 no-show | tag | ✅ | ✅ | s menami |
| WF6 referral | **pipeline stage** | ✅ | ✅ | s menami |
| WF7 recenzie | tag | ✅ | ✅ | s menami |

Kontrola 8/8: 0 cyklov, 0 triggerov mimo grafu, 0 dlhých pomlčiek.

## Čo čaká na tvoje rozhodnutie
1. **Byt → domov** naprieč PDF, webom a reklamami? (bod 11)
2. **Referral odmena** 100 € karta + 100 € zľava? (bod 12)
3. **No-show stage** do pipeline, alebo ostane tag? (bod 4)
4. Poistka **1 minúta alebo 5**? (bod 5)

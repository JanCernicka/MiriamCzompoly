# Zmeny 8. 10. 2026: konzola Miriam podľa konzoly DKP

Konzola https://miriam.shapelesai.sk (Pages `konzola-miriamczompoly`), nasadené 8. 10. 2026
okolo 10:25 UTC (`71d0dda4`) cez `konzola/nasad.sh`. Kód: `konzola/index.html` (kópia v `dist/`)
a `konzola/dist/_worker.js`.

## Príležitosti
- Štádiá idú pod sebou (zhora nadol), karty v štádiu zľava doprava. Ťahanie kariet nahradilo
  tlačidlo **Presunúť** na karte, ktoré otvorí okno so zoznamom štádií.
- Štádiá so sumou sa bez sumy presunúť nedajú:
  - Diagnostika zaplatená: „Koľko zaplatil za diagnostiku“, predvyplní sa suma z karty.
  - Projekt vyhraný (WON) a Realizácia: „Za koľko je projekt“, pole je prázdne, karta sa označí ako vyhraná.
  - Projekt prehraný (LOST): treba napísať dôvod, karta sa označí ako prehraná.
  - Recenzia / Referral: vyhraná, bez sumy.
  - Ostatné štádiá: karta je otvorená (aj keď sa vracia z prehraného).
- Suma a dôvod idú aj do poznámky kontaktu s dátumom („Projekt vyhraný (WON): 3 900,00 € / Zapísané v konzole ...“),
  lebo suma projektu prepíše sumu za diagnostiku bez stopy.
- Na karte: najbližší termín (alebo „Bol termín“), adresa a zdroj. Tlačidlo Rozhovor otvorí konverzáciu.
- Pravidlá sú v `PRAVIDLA_PREDVOLENE` vo workeri, dajú sa prepísať premennou `PRAVIDLA_PRESUNU` (JSON).
- Presun karty **nič nepošle**: v účte 8. 10. nie je zapnutý žiadny workflow so spúšťačom na kartu,
  štádium, nový kontakt ani značku (publikovaných je 5: 4 na termín v kalendári, 1 na formulár e-booku).
  `ZNACKY_PRE_STAGE` je prázdne. 🔴 Presun cez API aj tak `pipeline_stage_updated` nespustí (overené na DKP).

## Kalendár
- Klik na termín otvorí okno: kto, kedy, adresa, telefón, karta, tlačidlá Otvoriť rozhovor, Zavolať, Neprišiel.
- **Neprišiel** presunie kartu do No-show a do poznámky zapíše „Neprišiel na termín ...“. Termín v GHL
  ostáva bez zmeny (🔴 zmena stavu termínu spúšťa WF3 znova). Ide to až keď termín začal, najviac 7 dní dozadu.
  Termín, ktorého karta je v No-show, je v mriežke šrafovaný.
- Chýbal kalendár „Interiérová diagnostika online“ `wjoOfJUC7lOPYKU3pUlu`. Doplnený do tajomstva
  `KALENDARE_NAVIAC` (`ZSPaMW...,eXMsgOO2...,wjoOfJUC...`), konzola ukazuje 4 kalendáre.

## Konverzácie
- Záložky **Nevybavené** (predvolené, s počtom) a Všetky správy, hľadanie podľa mena, čísla alebo e-mailu
  vo všetkých konverzáciách (číslo s medzerami sa očistí).
- Tlačidlo **Vybavené** označí rozhovor v GHL ako prečítaný (s overením späť) a zmizne zo zoznamu hneď.
  Samotné otvorenie rozhovor neoznačí.
- Odkaz `?kontakt=<id>` otvorí konzolu rovno na rozhovore.

## Limit GHL
🔴 GHL dovolí 100 volaní za 10 sekúnd (`x-ratelimit-max: 100`, `x-ratelimit-interval-milliseconds: 10000`).
Kalendár a príležitosti predtým brali kontakty po jednom (35 + 30 volaní) a pri rýchlom preklikávaní
vracalo GHL 429. Teraz idú kontakty jedným volaním `POST /contacts/search` s filtrom
`{"field":"id","operator":"eq","value":[...]}` (do 100 id). Vracia `address`, nie `address1`. Overené na
všetkých 25 kontaktoch kariet: rovnaké adresy, telefóny aj značky ako GET na kontakt.

## Overené
- Lokálne proti živému GHL: všetky obrazovky na 1280 aj 390 px, žiadne chyby v konzole prehliadača,
  žiadne vodorovné posúvanie na mobile.
- Ostrý presun na dočasnom kontakte (DND, bez telefónu a e-mailu) a karte: zaplatená 249, vyhraný 3 900,
  prehraný s dôvodom, späť do Lead (otvorená), No-show s vetou. Každý krok prečítaný späť z GHL, 4 poznámky
  v kontakte, rovnaké štádium vráti 409. Kontakt aj karta potom zmazané (GET vráti 404 a 400).
- Naostro po nasadení: 4 kalendáre, 25 kariet, 35 nevybavených, stránka zhodná s `dist/index.html`.

## Otvorené
- Štádium „Diagnostika zaplatená (249 €)“: cena je dnes 290 € osobne a 250 € online. Názov štádia som
  nemenil, návrh je premenovať na „Diagnostika zaplatená“ (suma je teraz na karte).

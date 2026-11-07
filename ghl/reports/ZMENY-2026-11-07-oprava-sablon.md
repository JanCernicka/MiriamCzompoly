# 7. 11. 2026: oprava 6 pokazených e-mailových šablón (Plán od Miriam)

**Symptóm (Jano, 7. 11.):** testovacie e-maily 2, 3, 5, 7 a 8 v Gmaile ukazovali kus CSS (`@media (min-width:481px) …`) a namiesto textu prázdno, len tmavý obdĺžnik namiesto tlačidla.

**Príčina:** šablóny boli vyrobené cez `EmailDesign` z GHLtool (`email_builder.py`). Ten zapisuje rozmery bez jednotky (`font-size:16;`, `padding-top:8;`, stĺpec `width:100` → 100 px) a `customCss` = `<style></style>`. Text tak zdedil `font-size:0px` a zvyšok CSS vytiekol do tela. Overené na tele, ktoré GHL naozaj odoslal skutočnej horúcej z workflowu (vykreslené: písmo 0 px, viditeľný len CSS text).

**Dotknuté šablóny:** `6acce866` horúci 1, `6acce867` horúci 2, `6acce869` po hovore, `6acce86a` séria 1, `6acce86c` séria 2, `6acce86e` séria 3. V poriadku boli plán e-mailom a potvrdenie hovoru (z webu) aj obe potvrdenia diagnostiky (inline HTML vo WF3).

**Oprava:** návrh (dnd) každej šablóny: jednotky `px` (stĺpec `%`) ako v šablónach z GHL editora, bez duplicitných atribútov, `customCss` = `<style> /* custom styles */ </style>`. GHL HTML vyrenderuje z návrhu sám. Po oprave: písmo 16 px, stĺpec 100 %, text bez zmeny, v Gmaile (team@) náhľad začína „Ahoj …“. Záloha pôvodných návrhov je mimo repa (scratchpad sedenia).

**Dopad pred opravou:** 50 pokazených e-mailov 37 ľuďom: horúca 1 (5), horúca 2 (4), séria 1 (32), séria 2 (9). Séria 3 a „po hovore“ ešte nikomu neodišli. Plán e-mailom dostali všetci v poriadku. Všetkých 5 horúcich s pokazenou ponukou hovoru si hovor nerezervovalo.

**Otvorené:** či poslať opravené e-maily znova zasiahnutým (rozhodne Jano). Oprava nástroja v GHLtool navrhnutá ako samostatná úloha (GHLtool sa v tomto sedení nemení).

## Doplnené 7. 11. večer

**GHLtool opravený** s Janovým jednorazovým povolením, commit `26d4e96` na `main`: `email_builder.py` zapisuje jednotky a po uložení kontroluje uložené HTML (`EmailBuilder.skontroluj`), `oprav_dnd` opraví staré šablóny; kontrolný zoznam `lievik/05_KONTROLA.md` časť F (body 44 a 45, každý e-mail poslať sebe a otvoriť), cookbook, mapa API, pravidlo v CLAUDE.md.

**Plán znovuzaradenia** (čaká na Janovo OK, nič sa nespustilo): https://claude.ai/artifact/DRS1x6U3XZkXQhg5Kkqb3m

Fakty k 7. 11. 15:58: nikto z 37 neodpísal, nerezervoval ani sa neodhlásil.

| Skupina | Ľudí | Pokazené | Opravná sekvencia (deň 0 = zaradenie) |
|---|---|---|---|
| vlažní | 16 | séria 1 | séria 1, +2 dni séria 2, +3 dni séria 3 |
| vlažní | 9 | séria 1 a 2 | to isté |
| studení | 7 | séria 1 | séria 1, +7 dní séria 2, +11 dní séria 3 |
| horúci | 4 | horúci 1 a 2 | horúci 1, +1 deň horúci 2, +2 dni značka `plan-vlazny` |
| horúci | 1 | horúci 1 | to isté |

Postup po OK: 3 nové workflowy so značkovým spúšťačom, prvý krok `remove_from_workflow` z pôvodnej sekvencie (`4ec669dd`, `72d7be00`, `3c140460`); skúška na kontakte team@; doplniť ich do stop workflowu `d0e8c056` a znova zverejniť; zaradiť 37 značkou; overiť v Konverzáciách. Termín: pred 8. 11. 8:04, vtedy pôvodná sekvencia pošle 10 vlažným sériu 2. Zoznam ľudí: `zasiahnuti.json` a `stav.json` v scratchpade sedenia (mimo repa, osobné údaje).

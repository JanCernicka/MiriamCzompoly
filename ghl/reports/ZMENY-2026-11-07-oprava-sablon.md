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

## Vykonané 7. 11. 2026, 16:05 až 16:12 (Jano: „môžeš spustiť“)

| Workflow (zverejnený) | id | značka spúšťača |
|---|---|---|
| Plán OPRAVA 7. 11.: vlažní znova od série 1 | `9da70a19-e3bf-4041-a177-96f0687b2e83` | `plan-oprava-vlazna` |
| Plán OPRAVA 7. 11.: studení znova od série 1 | `a6fafb53-64ff-4fa0-adaf-eb828fd472ba` | `plan-oprava-studena` |
| Plán OPRAVA 7. 11.: horúci znova od e-mailu 1 | `26319ee7-7fe0-4065-a5ef-a825935f2209` | `plan-oprava-horuca` |

Každý: krok 1 `remove_from_workflow` z `3c140460`, `4ec669dd`, `72d7be00`, potom kroky pôvodnej sekvencie bez prvého čakania (okná 08:00 až 20:00 ostali). Stop workflow `d0e8c056` vyraďuje aj z týchto troch, zverejnený, 5 spúšťačov ostalo.

**Overené:** skúška na kontakte team@ (16:08): e-mail prišiel, vykreslený 16 px, kontrola HTML čistá, a team@ ostáva v opravnej sekvencii ako kontrolka ďalších krokov. Potom značka 37 ľuďom (pred tým každý znova prečítaný, nikto nemal hovor, diagnostiku ani DND). O 16:12 mal každý z 37 v konverzácii **presne jeden** nový e-mail, ten správny (25 + 7 séria 1, 5 horúci 1). Jeden skutočne odoslaný horúci 1 vykreslený: 16 px, tlačidlo „Vybrať čas hovoru“, žiadne CSS v tele.

**Ďalej:** séria 2 vlažným 9. 11., horúci 2 horúcim 8. 11., séria 2 studeným 14. 11. Pri monitoringu v tie dni pozrieť, že odišli a že nikto nedostal e-mail z pôvodnej sekvencie navyše.

## 7. 11. večer: prvá odpoveď a oprava konzoly

Gabriela (horúca, v opravnej sekvencii) o 16:34 odpísala na starý pokazený horúci 2. Konzola ukázala namiesto jej textu náš e-mail aj s CSS. **Príčina:** GHL drží e-mailové vlákno ako jeden záznam konverzácie, `body` je z prvého e-mailu vlákna (nášho), `direction` sa prepne na inbound a odpoveď je len ďalšie id v `meta.email.messageIds`. **Oprava** v `konzola/dist/_worker.js`: vlákna s odpoveďou sa čítajú po e-mailoch (`/conversations/messages/email/{id}`, najviac 16 na otvorenie rozhovoru), z odpovede ostane len text bez citácie (Gmail, Outlook, Apple, „Dňa … napísal(a):“), v bubline riadok „Odpoveď na e-mail …“; zo starých pokazených e-mailov sa CSS v texte nezobrazuje; náhľad v zozname bez citácie. Overené naostro cez `/api/sprava`: jej odpoveď „Ďakujem, perfektne!“, náš e-mail zvlášť, v zozname 0 náhľadov s CSS.

**Overiť 8. 11. po 16:15:** Gabriela nesmie dostať horúci 2 z opravnej sekvencie (jej odpoveď mala spustiť stop workflow `d0e8c056`, spúšťač `customer_replied`). GHL nemá čítanie aktívnych workflowov kontaktu, dá sa to overiť len podľa toho, či e-mail odíde.

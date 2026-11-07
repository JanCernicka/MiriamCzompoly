# 7. 11. 2026: oprava 6 pokazených e-mailových šablón (Plán od Miriam)

**Symptóm (Jano, 7. 11.):** testovacie e-maily 2, 3, 5, 7 a 8 v Gmaile ukazovali kus CSS (`@media (min-width:481px) …`) a namiesto textu prázdno, len tmavý obdĺžnik namiesto tlačidla.

**Príčina:** šablóny boli vyrobené cez `EmailDesign` z GHLtool (`email_builder.py`). Ten zapisuje rozmery bez jednotky (`font-size:16;`, `padding-top:8;`, stĺpec `width:100` → 100 px) a `customCss` = `<style></style>`. Text tak zdedil `font-size:0px` a zvyšok CSS vytiekol do tela. Overené na tele, ktoré GHL naozaj odoslal skutočnej horúcej z workflowu (vykreslené: písmo 0 px, viditeľný len CSS text).

**Dotknuté šablóny:** `6acce866` horúci 1, `6acce867` horúci 2, `6acce869` po hovore, `6acce86a` séria 1, `6acce86c` séria 2, `6acce86e` séria 3. V poriadku boli plán e-mailom a potvrdenie hovoru (z webu) aj obe potvrdenia diagnostiky (inline HTML vo WF3).

**Oprava:** návrh (dnd) každej šablóny: jednotky `px` (stĺpec `%`) ako v šablónach z GHL editora, bez duplicitných atribútov, `customCss` = `<style> /* custom styles */ </style>`. GHL HTML vyrenderuje z návrhu sám. Po oprave: písmo 16 px, stĺpec 100 %, text bez zmeny, v Gmaile (team@) náhľad začína „Ahoj …“. Záloha pôvodných návrhov je mimo repa (scratchpad sedenia).

**Dopad pred opravou:** 50 pokazených e-mailov 37 ľuďom: horúca 1 (5), horúca 2 (4), séria 1 (32), séria 2 (9). Séria 3 a „po hovore“ ešte nikomu neodišli. Plán e-mailom dostali všetci v poriadku. Všetkých 5 horúcich s pokazenou ponukou hovoru si hovor nerezervovalo.

**Otvorené:** či poslať opravené e-maily znova zasiahnutým (rozhodne Jano). Oprava nástroja v GHLtool navrhnutá ako samostatná úloha (GHLtool sa v tomto sedení nemení).

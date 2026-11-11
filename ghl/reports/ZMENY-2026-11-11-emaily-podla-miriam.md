# 11. 11. 2026: e-maily po pláne podľa Miriaminho feedbacku z 8. 11.

Jano (11. 11.): „opravte e-maily, nech sú všetky podľa Miriam … tým, čo už boli v starej sekvencii, pošleš iba tie nové maily.“
Zdroj: kontrola e-mailov, odoslaná 8. 11. 14:44 (poznámka „KONTROLA E-MAILOV“ na Miriaminom kontakte, D1 `koncepty` riadok `emaily`).

## Čo sa zmenilo

| E-mail | Kde je | Zmena |
|---|---|---|
| plán e-mailom | web, `functions/_lib/profil.js` `emailPlan` | veta o diagnostike podľa nej, pod ňou tlačidlo „Diagnostika“ na /diagnostika |
| potvrdenie hovoru | web, `emailPotvrdenie` | „Pred hovorom si prejdem tvoje odpovede, aby sme sa mohli venovať priamo tvojej …“ (3. pád, overené pri všetkých 7 miestnostiach) |
| horúci 1 | šablóna `6acce866` | tlačidlo „Vybrať čas hovoru“ vedie na cal.com |
| horúci 2 | šablóna `6acce867` | bez „aby si nečakala,“; odkaz „vybrať čas hovoru“ na cal.com |
| po hovore | šablóna `6acce869` | odsek s rezerváciou diagnostiky a odpočtom ceny, „Nestihli sme sa pri hovore spojiť? …“ |
| séria 2 | šablóna `6acce86c` | veta o Jitke podľa nej |
| séria 3 | šablóna `6acce86e` | „u teba doma, do 25 km od Trnavy je cesta v cene“; ponuka 10-minútového hovoru cez cal.com |
| diagnostika doma | WF3 `e8120656`, e-mail priamo v kroku | „stretnutie“ namiesto „hovor“; „Do troch dní po diagnostike ti pošlem písomné zhrnutie.“ |
| **nový** Nanútim ti svoj štýl? | šablóna `6af43280cef83416e7e998b6` | jej text |
| **nový** Koľko stojí jeden zlý nákup | šablóna `6af43282f081782f1d53ac2d` | jej text, tlačidlo „Rezervovať diagnostiku“, podpis Miriam doplnený ako vo všetkých ostatných |

Zálohy pôvodných návrhov a HTML sú mimo repa (scratchpad sedenia, `emaily-v2/zaloha`). Každá šablóna po uložení prečítaná späť, `skontroluj_html` bez chýb, vykreslená 16 px, všetkých 9 upravených e-mailov poslaných na team@ a v Gmaile bez CSS.

**cal.com:** Miriam chcela „Vybrať čas hovoru“ všade na `https://cal.com/konzultacia/10-min-hovor-s-interierovou-dizajnerkou`, Jano 11. 11.: „všetky podľa Miriam“. Dôsledok: hovor rezervovaný cez cal.com nie je v GHL ani v konzole, nepríde pripomienka ani e-mail po hovore a značka `plan-hovor` nevyradí človeka zo sekvencií. Stránka po otázkach (/profil-rezervacia) ostáva na našom kalendári.

## Nové e-maily v sekvenciách

Staré workflowy sa nemenili (ľudia v nich pokračujú). Nové e-maily posielajú samostatné workflowy na tie isté značky, takže spolu dajú poradie, ktoré Miriam vybrala:

| Workflow (zverejnený) | id | spúšťač | kroky |
|---|---|---|---|
| Plán: nové e-maily vlažným, 4. a 7. deň | `9206efd7…` | `plan-vlazny` | 4 dni, Nanútim, 3 dni, Koľko |
| Plán: nové e-maily studeným, 15. a 22. deň | `1b6c344f…` | `plan-ostatni` | 15 dní, Nanútim, 7 dní, Koľko |
| Plán: doplnenie 2 nových e-mailov pre staršie kontakty | `3f04f34b…` | `plan-doplnenie` | Nanútim, 3 dni, Koľko |

Vlažní: plán, séria 1 (1), séria 2 (3), Nanútim (4), séria 3 (6), Koľko (7). Studení: plán, séria 1 (3), séria 2 (10), Nanútim (15), séria 3 (21), Koľko (22). Miriam napísala pri studených Koľko na 21. deň, ale v ten deň chodí séria 3, preto 22. deň (o deň po sérii 3, ako pri vlažných). Horúci a po hovore dostanú obidva nové cez značku `plan-vlazny`. Stop workflow `d0e8c056` vyraďuje aj z týchto troch (spolu 9 workflowov, 5 spúšťačov).

## Ľudia zo starej sekvencie: len nové e-maily

Snímka 11. 11. 09:20 UTC: 106 kontaktov so značkou `plan-vlazny` alebo `plan-ostatni` (potom sa zverejnili nové workflowy). Každý dostane značku `plan-doplnenie` až po poslednom e-maile starej sekvencie („Keď budeš chcieť ísť ďalej“) aspoň pred 20 hodinami, aby nedostal dva e-maily v jeden deň. Vynechaní: kto odpísal (5), kto má značku diagnostiky, DND, Janove testovacie kontakty, kto už Nanútim dostal. Značku diagnostiky má k 11. 11. len testovací kontakt team@ (76Luqq…), skutočná rezervácia diagnostiky z plánu zatiaľ nie je žiadna. 11. 11. nedokončil starú sekvenciu nikto (prví opravení vlažní 12. 11., studení najneskôr 1. 12.).
Kontroluje to naplánovaná úloha „Doplnenie nových e-mailov Miriam“ (`trig_01Ft1xJ4DaEtWck7VgXFeNgh`, denne 9:17), skript `emaily-v2/doplnenie.py` v scratchpade sedenia; keď nikto nečaká, úlohu vypne. Kontrolka: team@ dostal značku hneď a „Nanútim“ z workflowu mu prišiel 11. 11. 09:23 UTC.

## Stránka na kontrolu e-mailov, kolo 2

/kontrola-emailov-q7m2xh: verzia po 8. 11., značky „upravené podľa teba 8. 11.“ a „nový e-mail“, nové e-maily na svojich miestach vo všetkých štyroch sekvenciách, prázdne políčka. Ukladá sa do D1 `emaily-2` (kolo 1 ostáva pod `emaily`). Ďalšie kolo: v generátore zvýšiť `KOLO`.

## Otvorené

- Newsletter pre studených po 21 dňoch: Miriam ho chce pripraviť do 3 týždňov.
- Zastavenie sekvencií po odpovedi (stop workflow na `customer_replied` nevyradil Gabrielu 8. 11.): čaká na Janovo rozhodnutie.

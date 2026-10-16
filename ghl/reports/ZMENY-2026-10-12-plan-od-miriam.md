# Lievik „Plán od Miriam“ (12. 10. 2026), náhľad, nie naostro

Nahrádza „Pocitový profil domova“ z 8. 10. (`NAVRH-2026-10-08-lead-magnet.md`). Otázky, odpovede a texty plánu
napísala Miriam a Jano s ňou dohodol 10-minútovú konzultáciu, na ktorej plán horúcim odovzdá osobne.
Vetva `claude/profil-lievik`, nasadené `./nasad-web.sh profil`: https://profil.miriam-web-staging.pages.dev/profil
Všetky SMS a e-maily na schválenie (artifact): https://claude.ai/artifact/Bj7X7TxZY8GE6k7HDWWT5S .
Pre Miriam (tok, snímky stránok, ukážka plánu, 6 šablón, miestnosti s fotkami, správy, 2 videá na natočenie): https://claude.ai/artifact/WHD32NPCjCFqD9bkiLT6wF . Zdieľa ju Jano cez Share. Texty sem nekopírovať, žijú v šablónach GHL a v `functions/_lib/profil.js`.

## Tok (zmena 12. 10. večer, Jano: celý formulár na stránke, rezervácia len telefón)
1. `/profil`: hero s videom 16:9, 4 body, **celý formulár na stránke** (6 otázok od Miriam, 7. krstné meno,
   8. e-mail), o mne. Otázky: miestnosť (7), čo prekáža (6), čo ponechať (5), pocit (6), kedy (4), rozpočet (5).
2. `/api/profil` zapíše kontakt a vráti skupinu.
3. Skupiny (Miriam): **horúci** = hneď alebo do 3 mesiacov A ZÁROVEŇ od 3 000 €. **Vlažný** = platí jedno z toho. **Ostatní** = nič.
   - horúci → `/profil-rezervacia`: „Tvoj plán ti odovzdám osobne“, video 16:9, 10-minútový hovor, Miriam volá.
     Doplní **len telefón**, meno a e-mail nesie sessionStorage. Bez nich (odkaz z e-mailu) sa ukážu aj tie polia.
   - vlažní a ostatní → plán e-mailom (s pozvánkou na diagnostiku) a hneď **`/diagnostika?plan=odoslany&utm_source=plan-od-miriam`**:
     dnešná stránka diagnostiky (A aj B, s jej videom), hore zelený pruh „Plán ti odišiel do e-mailu. Ešte neodchádzaj“
     (`functions/diagnostika.js`). Lišta s návodom sa im nezobrazí. `/profil-dakujem` je preč.
   - 🔴 A/B test diagnostiky: títo ľudia sa delia na A/B ako ostatní. Pri vyhodnotení ich vyradiť cez `zdroj = plan-od-miriam`.
4. Videá na `/profil` a `/profil-rezervacia` Miriam ešte natočí. Zatiaľ je tam miesto, video sa doplní do `data-src` (`assets/js/profil-video.js`).
4. `/plan?m=&d=&n=&p=`: plán v poradí od Miriam (oslovenie, verdikt a úvod, veta o nábytku, 3 kroky,
   odsek o pocite, jej realizácia, diagnostika). Odkaz naň chodí e-mailom.

13. 10. (Jano): otázka o miestnosti má ikony namiesto fotiek (na každú miestnosť fotky nemáme) a plán ukazuje
realizáciu **pred a po**. Dvojice z toho istého bytu: obývačka a spálňa (Jitka), kuchyňa a kúpeľňa (byt pre staršiu pani).
Detská, predsieň a pracovný kút vlastnú dvojicu nemajú, majú byt pre staršiu pani s vetou, ktorá to nezamlčí.
Od Miriam pýtame fotky pred a po pre tieto tri miestnosti. 16. 10. poslala detskú (počas stavby a hotová), predsieň (pred a po, to isté zrkadlo a skrine) a celú fotku
kúpeľne z bytu pre staršiu pani (`miriam-*.jpg`). Bez vlastnej dvojice ostáva len pracovný kút. Na úvode sa nesľubuje „pošlem“, len „dostaneš“ a „získať“.

Videoponuku pre horúcich („pošli fotku, pošlem video“) nahradil hovor. Fotky realizácií sme vybrali z webu
(`MIESTA` v `assets/js/profil-data.js`), vety pod nimi sú z popisov projektov na webe.

## Súbory
`profil.html`, `profil-rezervacia.html`, `plan.html`, `functions/diagnostika.js` (zelený pruh), `assets/css/profil.css`,
`assets/js/profil-data.js` (otázky, texty, skupiny; číta ho aj server), `profil-formular.js`, `profil-video.js`,
`profil-rezervacia.js`, `plan.js`, `functions/api/profil.js`, `functions/api/rozhovor.js`, `functions/_lib/profil.js`
(e-maily a SMS), `functions/api/sloty.js` (`typ=rozhovor`). `profil-vysledok`, `profil-dakujem` a `profil-test.js` sú preč.

## GHL (založené 12. 10.)
- Kalendár „Hovor k plánu (10 min)“ `Mrfqa49pMQPuVyba2nqm`: po až pi 9:00 až 16:30 každú pol hodinu, 5 min rezerva,
  najskôr o 2 hodiny, najďalej 14 dní. Bez GHL notifikácií a bez Google pozvánky (bola po anglicky).
- Polia kontaktu: `plan_odpovede`, `plan_odkaz`, `plan_rezervacia`, `plan_miestnost`, `plan_verdikt`, `plan_krok1`.
- Značky: `plan-test` (každý), `plan-horuci` / `plan-vlazny` / `plan-ostatni`, `plan-hovor` (rezervoval hovor).
- `/api/profil`: kontakt, polia, značky, poznámka; vlažným a ostatným hneď e-mail s plánom (Conversations, ako `/api/navod`).
- `/api/rozhovor`: termín, karta v „Krátky hovor rezervovaný“, poznámka, potvrdenie zákazníčke (SMS + e-mail) a SMS Miriam
  s odkazom na plán. Všetky SMS bez diakritiky a do 160 znakov, overené na všetkých kombináciách (najdlhšia 154).
- Workflowy, **všetky KONCEPT**, nič nebeží:
  - `9e385053` hovor: SMS hodinu pred, e-mail s plánom 30 min po začiatku, po 2 dňoch značka `plan-vlazny`
  - `ae8d6154` zrušený hovor: vyhodí z `9e385053`
  - `3c140460` horúci bez hovoru: po 2 h e-mail „plán čaká na 10 minút“, po dni plán písomne, po 2 dňoch `plan-vlazny`
  - `4ec669dd` vlažní: 3 e-maily po 1, 3 a 6 dňoch (prvý krok, nekupuj hneď, diagnostika)
  - `72d7be00` ostatní: tie isté 3 e-maily po 3, 10 a 21 dňoch
  - `d0e8c056` zastavenie: značky `plan-hovor`, `diagnostika-osobne`, `diagnostika-online`, `diagnostika-rezervovana`
    alebo odpoveď vyhodí z `3c140460`, `4ec669dd`, `72d7be00`
- E-mailové šablóny (Claude): `6acce866` `6acce867` `6acce869` `6acce86a` `6acce86c` `6acce86e`.
- 🔴 GHL od 12. 10. odmieta `remove_from_workflow` s `{"workflows": [...]}`, chce `{"type": "remove_from_workflow", "workflow_id": [...]}`.

## Overené
- Náhľad: obe cesty preklikané na 390 aj 1280 px, bez chýb v konzole, bez vodorovného posúvania.
- Ostrý zápis lokálne (`TEST_REZIM=ghl-bez-sprav`) na dočasnom kontakte @example.com: polia, značky, poznámky, termín
  v novom kalendári, karta, obsadený čas vráti 409, neplatné číslo vráti hlášku. Termín, karta aj kontakt potom zmazané.
- Neoverené naostro: odoslanie e-mailu s plánom a SMS (rovnaké volanie ako `/api/navod` a WF3) a beh workflowov.

## Na spustenie treba
1. Jano a Miriam prejdú náhľad a texty e-mailov (šablóny vyššie).
2. Publikovať workflowy a urobiť jeden ostrý test na vlastnom čísle a e-maile.
3. Zlúčiť vetvu do `claude/lievik-checklist`, nasadiť `./nasad-web.sh`, zmeniť `noindex` podľa toho, či ide aj do Googlu.
4. Meranie a pixel (stránky zatiaľ neposielajú udalosti do konzoly ani do Meta) a reklama na `/profil`.

## Otvorené
- Kúpeľňa: niektoré kroky sedia horšie (lampa do rohu, záclony po zem, presunúť veľký kus nábytku, vankúše). Jano sa pýtal prečo,
  vysvetlené 12. 10. v chate. Kým sa nerozhodne, ostávajú Miriamine texty bez zmeny.
- E-mail s plánom dostanú vlažní a ostatní hneď; horúci až po hovore, alebo po dni, ak si hovor nerezervujú.

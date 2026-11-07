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
     dnešná stránka diagnostiky (A aj B, s jej videom), hore zelený pruh: plán odišiel na e-mail, pozri aj spam,
     ešte neodchádzaj (`functions/diagnostika.js`, text tam). Lišta s návodom sa im nezobrazí. `/profil-dakujem` je preč.
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

## Naostro 28. 10. 2026 (Jano: Miriam súhlasí, zapnúť workflowy, nasadiť na poddoménu, nová kampaň 15 €/deň)
- **Web:** vetva zlúčená do `claude/lievik-checklist`, nasadené `./nasad-web.sh`. Lievik beží na www.miriamczompoly.sk/profil
  a po DNS aj na **plan.miriamczompoly.sk** (`functions/_middleware.js`: „/“ ukáže /profil, lievik a API idú ďalej,
  ostatné presmeruje na www; noindex v `_headers`).
- 🔴 **DNS čaká na Jana:** u Webhouse CNAME `plan` → `miriam-web-staging.pages.dev`. Doména je v Cloudflare projekte
  pridaná, stav pending. DNS miriamczompoly.sk nie je v Cloudflare (ns*.webhouse.sk).
- **Videá** (Drive „Plán od Miriam - VSL a jadrá reklám (27. 10.)“, strihový dokument tam), v GHL médiách:
  VSL 1 `735fcb7d-ca44-4979-bc0a-a56d898f610c.mp4` + poster `a3dcad50…jpg`, VSL 2 `1635dab4-0242-4c22-8d4e-e573a66fb276.mp4`
  + poster `0b24f32a…jpg`, jadro A `f7810eb1…mp4`, jadro B `f257fafd…mp4`. Formulár je hneď pod VSL 1.
- **Pixel** 2324280084711918 cez `consent.js` (len po súhlase): Lead po odoslaní formulára, Schedule po rezervácii hovoru.
- **Workflowy:** všetkých 6 publikovaných (draft → published), všetky triggery `active: true`, prečítané späť.
- **Ostrý test** 28. 10. ~10:00 UTC na www: ostatní (e-mail s plánom prišiel do team@shapelesai.com, Primary, odkazy OK)
  aj horúci (značky plan-test + plan-horuci, bez e-mailu, ako má byť). Rezervácia hovoru naostro netestovaná: poslala by SMS Miriam.
- **Workflow 3c140460 overený 28. 10. 13:20 UTC:** horúci kontakt z formulára o 10:49:18 dostal e-mail „Tvoj plán čaká na
  10 minút“ o 12:49:21, presne po 2 h. GHL ho hlási ako `delivered` cez Mailgun na team+plan-test-horuci2@shapelesai.com.
  ⚠️ V Gmaile team@shapelesai.com ho cez MCP nevidno (ani v koši). MCP nečíta spam, takže skončil asi tam: Jano, pozri spam.
  Zastavenie funguje: kontakt, ktorý o 10:47 dostal plan-hovor (rezervácia), e-mail nedostal, v konverzácii má len aktivity.
- Testovacie kontakty `wJDbjUv7Wqqi2BdwUTCP`, `xJpQPk7hh11uXdMCxv3W` a `1jeusXIqHzmuJJSBvQqi` (horuci2) zmazané 28. 10.,
  GET vracia „Contact not found“. Janov kontakt `76LuqqtLjgAoHQtUlaH3` ostáva, má z testu rezervácie značky plan-test,
  plan-horuci a plan-hovor.
- ⚠️ E-maily odchádzajú z `dizajn+miriamczompoly.sk@lc.shapelesai.com`, nie z Miriaminej domény (docs/odosielacia-domena.md).
- **Meta** (ad účet 1210955550121224), všetko PAUSED: kampaň `120250871021660477` „Miriam Czompoly: Leads - Plán od Miriam -
  október 2026“, Leads, CBO 15 €/deň; zostava `120250871026540477` Trnava +70 km (pokryje BA aj NR), ženy, vek 30-65 ako návrh
  (Advantage+), bez AT/CZ/HU, pixel LEAD; reklamy `120250871038440477` (jadro A) a `120250871047400477` (jadro B), jedno copy,
  „Zistiť viac“, odkaz plan.miriamczompoly.sk s UTM. Stará kampaň na diagnostiku `120250318272510477` už bola pozastavená.
  Hooky zatiaľ nie (Jano), preto 2 reklamy namiesto 10. Spustiť až po DNS a po Janovom „spusti“.
- Prehľad pre Jana (artifact): https://claude.ai/artifact/LLpdm2S8HxVDKejbcR4soR

## Pred spustením 2. 11. 2026 (Jano: oprav placeholder kampaň, oblasti do 70 km od Trnavy, upsell, audit)
Správa pre Jana (artifact): https://claude.ai/artifact/XQx8Crpwa1Vs1ib4Zd8ewW . Text sem nekopírovať, tu len fakty.
- **Meta:** kampaň `120250960912100477` „Miriam Czompoly: Leads - Plán od Miriam - 9 kreatív - november 2026“ PAUSED,
  15 €/deň CBO, Leads. Zostava `120250960914520477` ACTIVE: 6 bodov s polomerom (BA 20 km, Senec 8, Pezinok 8,
  Trnava 15, Piešťany 8, Nitra 12; najďalší okraj 64 km od Trnavy), bez AT/CZ/HU, ženy 30-65 ako návrh A+A, pixel LEAD.
  9 placeholder reklám (`[PLACEHOLDER]`, example.com, SIGN_UP) DELETED, 9 nových ACTIVE: jedno copy, nadpis,
  LEARN_MORE, odkaz `www.miriamczompoly.sk/profil` s UTM (`utm_content` = meno reklamy, overené v živom náhľade),
  AI označenie h8, h9, h10. 7 schválených, B3-h5 a B3-h7 v kontrole. **Spustenie = zapnúť kampaň.**
- **Upsell** (commit `b4e20e5`): `/diagnostika?plan=odoslany` ukáže e-mail zo sessionStorage a spam,
  `/diagnostika?hovor=rezervovany&kedy=<ms>` po rezervácii hovoru (`location.replace`). E-mail ani telefón do adresy nejdú (pixel).
- **Reklama na kontakte** (commit `9f2d850`): `/api/profil` píše do poznámky „Reklama: <utm_content> (zdroj / médium / kampaň)“.
- **Overené naostro 2. 11.:** cesta ostatní na www s UTM reklamy B2-h5 (kontakt `ZJdQ72KcpAcKVVQXYgKv`: 2 značky,
  6 polí, poznámka s reklamou, plán v doručenej pošte team@shapelesai.com, 0 požiadaviek na Metu bez súhlasu),
  potom zmazaný, čítanie späť „Contact not found“. Triggre 6 workflowov a starých pripomienok (iné kalendáre),
  voľné časy na 7 dní: hovor 80, diagnostika 48, online 48. Rezervácia hovoru len na náhľade (naostro by poslala SMS Miriam).
- **Otvorené:** reklama so záhradou (h10, formulár záhradu nemá; odporúčam vypnúť, rozhodne Jano), OK od Miriam na mená
  Hlavatých a Jitky v reklame (na webe sú verejne), pixel Lead len po súhlase (2 za 27 dní, Schedule 0, bez CAPI),
  agentúrna odosielacia doména, 18 osirelých príspevkov po placeholder reklamách, októbrová kampaň s odkazom na plan.*.
- **Druhá dávka 9 reklám s AI hlasom** (2. 11. večer, od druhého AI, podklady na Drive „Plán od Miriam: 9 reklám s AI hlasom“):
  AI1, AI2, AI3 (verzie jadra) × h11 vidiecky byt, h12 Hlavatí, h13 záhrada. Celý hlas je klon Miriaminho hlasu (ElevenLabs).
  Placeholdery DELETED, nové ACTIVE s rovnakým copy, nadpisom, LEARN_MORE, odkazom s UTM (overené v náhľade) a AI označením:
  `120250979364110477` … `120250979367620477`. V kampani je 18 reklám, kampaň stále PAUSED.
- **Všetky správy na kontrolu** (artifact, 21 e-mailov a SMS): https://claude.ai/artifact/RKcFqGoTsNZNfpc62tscwM .
  Nahrádza verziu z 12. 10. (https://claude.ai/artifact/Bj7X7TxZY8GE6k7HDWWT5S). Texty sem nekopírovať.
- **Ďalšie otvorené z 2. 11. večer:** citát Hlavatých v hooku (h12 aj B2-h9) je iný než recenzia na webe („prídeme… máme obrovskú
  radosť“ verzus „prídem k mame do bytu, mám radosť“); AI hlas hovorí „Plány zadarmo robím do konca mesiaca“ (1. 12. obnoviť alebo
  vypnúť); záhradu ukazujú 4 reklamy; online diagnostika: odkaz na hovor žiadna automatická správa neposiela; SMS diagnostiky s
  diakritikou v mene alebo adrese idú ako 2 SMS; zrušený hovor = plán e-mailom nepríde.

## Spustené 3. 11. 2026 (Jano: „skontroluj, či všetko správne posiela, napojené na konzolu, resetuj štatistiku a zapni reklamu“)
- **Meranie plánu do konzoly** (predtým stránky plánu do D1 neposielali nič): `assets/js/plan-meranie.js` na `/profil` a
  `/profil-rezervacia`, kroky `plan-pristal`, `plan-video-zvuk`, `plan-video-polovica`, `plan-formular-videl`,
  `plan-formular-zacal`, `plan-odoslal` (meta = skupina), `plan-rezervacia-pristal`, `plan-hovor-rezervovany`. Ten istý sid
  ako na `/diagnostika`, takže upsell sa počíta na toho istého človeka a tú istú reklamu. Nový krok treba pridať do
  `KROKY` vo `functions/_lib/lievik.js`, do zberača (`KROKY_PLAN`) aj do konzoly (`PLAN_POPIS`).
- **Zberač** `cast=plan`, **konzola** pohľad „Plán od Miriam“ (predvolený): lievik, skupiny, podľa reklamy, podľa zariadenia.
  Overené naostro testom s `utm_content=testmerania` (všetky kroky 200, v konzole 1 človek), potom zmazané resetom.
- 🔴 `/api/krok` zahodí UA s HeadlessChrome (robot). Test v Playwright potrebuje bežný UA, beacon sa chytá cez `ctx.route`.
- **Konzola na mobile:** tabuľka podľa reklamy bola širšia ako displej (447 až 601 px na 390 px), teraz užšie bunky a posun len vo karte.
- **Reset štatistiky 3. 11. 09:09 UTC (10:09 miestneho):** všetkých 3702 riadkov `udalosti` (diagnostika od 26. 9.,
  1680 príchodov, 3 rezervácie, plus test) skopírovaných do D1 tabuľky `udalosti_archiv` (`archivovane = 1793696940000`,
  počty aj súčty overené), potom zmazané z `udalosti`. Súbor: `meranie/zalohy/miriam-lievik-2026-11-03-pred-resetom.sql.gz`
  (`wrangler d1 export --remote`, overený obnovou do SQLite, sha256 nerozbaleného `39261a9a…ec3c`). Všetky tri pohľady
  konzoly (plán, diagnostika, A/B) aj `PLAN_OD` v zberači začínajú týmto časom.
- **Pred zapnutím overené:** 6 workflowov plánu published s aktívnymi triggrami, WF3 diagnostika aj online published,
  hovor k plánu 76 voľných časov na 7 dní, 18 reklám schválených (CAMPAIGN_PAUSED), 0 chýb doručenia. Odosielanie:
  pozri 28. 10. a 2. 11. (potvrdenie, SMS zákazníkovi aj Miriam, pripomienka, plán e-mailom, E1, horúci 2 h).
- **Kampaň `120250960912100477` ACTIVE** 3. 11. okolo 09:14 UTC, 15 €/deň, všetkých 18 reklám ACTIVE. Októbrová a
  septembrová kampaň ostávajú PAUSED. Meno kampane stále hovorí „9 kreatív“ (kozmetické, nemenené).
- **UZAVRETÉ, NEOTVÁRAŤ (Jano 3. 11.: „všetko je to v poriadku a nerieš to vôbec“):** 4 reklamy so záhradou
  (B2-h10, AI1/2/3-h13), citát Hlavatých v B2-h9 a AI1/2/3-h12, „Plány zadarmo robím do konca mesiaca“ v AI hlase.
  Ostávajú tak, ako sú, a ďalšie sedenie ich už nenavrhuje meniť.
- **Priebežná kontrola** (Jano 3. 11.: „priebežne monitoruj, či všetko funguje, či nie sú tam žiadne chyby“):
  `meranie/kontrola_kampane.py` len číta: web a `/api/krok`, D1 od resetu (kroky, reklamy, zariadenia), konzolu,
  nové kontakty s `plan-test` (skupina, reklama z poznámky, `plan_odkaz`, e-mail s plánom do 15 min, SMS po hovore)
  a každú nedoručenú správu v účte. Meta sa kontroluje cez MCP (doručovanie, chyby, zamietnuté reklamy).
  Plánovaná úloha v sedení 4× denne (11:41, 14:41, 19:41, 22:41). Prvý beh 10:24: 0 chýb, ešte bez návštev.

## Miriamine opravy textov 3. 11. 2026 (WhatsApp so screenshotmi z prehľadu správ, cez Jana)
Prehľad správ aktualizovaný na tej istej adrese: https://claude.ai/artifact/RKcFqGoTsNZNfpc62tscwM (verzia 2). Starý text → nový:
- **Veta o diagnostike** (šablóna „Plán: sekvencia 3“ `6acce86e…`, e-mail s plánom v `functions/_lib/profil.js`, stránka `/plan`
  v `plan.html` a `assets/js/plan.js`): „aby si neprepálila peniaze, robím na diagnostike“ → „aby si zbytočne nevyhodila peniaze,
  riešim na diagnostike“. Miriam ju označila v 3. e-maile, zmenené všade, kde je tá istá veta.
- **Horúci 1** (šablóna `6acce866…`): „tvoj plán je pripravený a rada by som ti ho prešla osobne. Stačí 10 minút po telefóne,
  zavolám ti ja.“ → „tvoj plán je pripravený a rada by som ho s tebou prešla na krátkom hovore.“ (malé „t“ ako po každom „Ahoj …,“).
- **Potvrdenie hovoru k plánu** (web `/api/rozhovor`, `emailPotvrdenie`): „Ak chceš, odpíš mi na tento e-mail fotkou tej miestnosti,
  pripravím sa lepšie.“ → „Aby sme hovor využili naplno, priprav si prosím: pôdorys bytu alebo domu, ak ho máš (stačí aj nákres
  na papieri).“ Kam veta patrí, rozhodol Jano (Miriam ju poslala pri screenshote diagnostiky doma).
- **WF3 diagnostika doma** (`e8120656`, verzia 21 → 22): zmazaný bod „ak riešiš priestor s partnerom alebo rodinou, nech sú pri tom“
  (Miriam: „To tam nikdy nebudem chcieť.“). Ostatné body bez zmeny.
- **WF3 online** (`fc2d7ac6`, verzia 6 → 7): „Ako sa spojíme, ti napíšem pred termínom.“ → odkaz na Google Meet
  `https://meet.google.com/meet/pxh-papk-ekh` (Miriam: „vždy bude jeden“; tvar bez `/meet/` presmeruje sem);
  „Aby sme čas nestrácali obhliadkou, pošli mi prosím najneskôr deň vopred, stačí odpoveďou na tento e-mail:“ → „Aby sme na
  hovore nestrácali čas, pošli mi prosím najneskôr deň vopred (stačí odpísať na tento e-mail):“; „(stačí fotka z papiera)“ →
  „(stačí aj nákres na papieri)“. Fotky z viacerých uhlov ostali (Miriam ich nevynechala, len boli v označení medzi riadkami).
  SMS 2 hodiny pred má odkaz na Meet (Jano: áno), 122 znakov plus meno, GSM-7, 1 SMS.
- Obe WF3 po zápise: published, triggre aktívne, 10 krokov, nastavenia workflowu nezmenené. Šablóny prečítané späť, starý text preč.

## Príležitosti a odpovede v konzole, 3. 11. 2026 (Jano: „dvaja odoslali otázky, v príležitostiach ich nevidím a v konverzáciách nevidím, čo vyplnili“)
- **Príčina:** `/api/profil` kartu v pipeline nezakladal, len hovor (`/api/rozhovor`) a diagnostika (`/api/termin`).
  Konzola v rozhovore ukazovala len formuláre GHL, otázky plánu sú v poznámke kontaktu.
- **Oprava webu:** `prilezitost()` vo `functions/_lib/ghl.js`. Formulár založí kartu vo fáze Lead
  (`e8f6e92b…`, meno „meno · e-mail“, zdroj „Plán od Miriam“). Hovor kartu z Lead posunie na Krátky hovor
  rezervovaný, diagnostika z Lead alebo z hovoru na Diagnostika rezervovaná (aj so sumou, keď je 0).
  Inú otvorenú kartu nechá tak. Overené falošným GHL (5 prípadov) a naostro priamym POST s
  `team+konzola-3-11@shapelesai.com` (karta v Lead), potom kontakt aj karta zmazané (404). Bez zápisu do D1.
- **Konzola:** v rozhovore blok „Otázky Plán od Miriam“ zo všetkých poznámok „Test na /profil“: skupina, 6 odpovedí,
  reklama, klikateľný odkaz na plán. Na karte pole „Plán: horúca / vlažná / ostatná“ zo značky kontaktu.
- **Doplnené:** karty v Lead pre 2 kontakty z dneška (…0ZOrc9 z B2-h9, …BLTNj5 z B2-h6), prečítané späť.
- `meranie/kontrola_kampane.py` hlási kontakt z plánu bez otvorenej príležitosti ako chybu.

## Štádium lead magnet, rozpočet v konzole a Miriamine opravy 2 (4. 11. 2026)
- **Nové štádium** „Zobral lead magnet (plán na víkend)“ `51108ff3-4d4a-4ae3-80bf-c90fa36b278c`, hneď za Lead
  (Jano). Všetkých 41 kariet a 12 starých štádií ostalo, 14 kariet z plánu presunutých z Lead sem. Formulár `/profil`
  zakladá karty tu (`FAZA_LEAD_MAGNET`), hovor ich posunie z Lead aj odtiaľto, diagnostika z Lead, odtiaľto aj z hovoru.
  Overené naostro priamym POST s `team+konzola-4-11@shapelesai.com`, potom kontakt aj karta zmazané.
  🔴 PUT pipeline sa uložil, ale okamžité čítanie späť ho ešte neukázalo; druhý PUT GHL odmietol (422 `locationId`),
  takže duplikát nevznikol. Pri pipeline čítať späť s pauzou, nie hneď opakovať zápis.
- **Rozpočet v konzole** (Jano): na karte v Príležitostiach (pod Zdroj a Plán), v zozname konverzácií pod ukážkou
  správy a v hlavičke otvoreného rozhovoru. Berie sa z poľa `plan_odpovede` (posledná zo 6 odpovedí).
- **Miriamine opravy 2** (WhatsApp 3. 11. 16:22 až 16:34, so screenshotmi; nahrádzajú prvú dávku tam, kde sa líšia):
  - potvrdenie hovoru (web): „Ak chceš, odpíš mi na tento e-mail a prilož fotku miestnosti, ktorú chceš riešiť, aby som sa
    vedela lepšie pripraviť.“ Veta o pôdoryse z 3. 11. tu bola omylom, Miriam ju myslela k diagnostike.
  - horúci 1: predmet „Tvoj plán je pripravený“ (workflow `3c140460`, verzia 6), telo doplnené o „Stačí 10 minút, zavolám ti ja.“
  - WF3 doma (`e8120656`, verzia 23): „Aby sme hovor využili naplno, priprav si prosím:“ a „pôdorys bytu alebo domu, ak ho máš
    (stačí aj nákres na papieri)“. Zoznam vecí, ktoré hnevajú, a rozpočet ostali (neboli v jej texte, len v označení).
  - WF3 online (`fc2d7ac6`, verzia 8): ten istý úvod a ten istý pôdorys. Fotky z viacerých uhlov ostali z rovnakého dôvodu.
    SMS po rezervácii stále hovorí „Fotky a podorys mi prosim posli vopred“, nemenené.
  - Prehľad správ, verzia 3: https://claude.ai/artifact/RKcFqGoTsNZNfpc62tscwM

## Horúca aj „hneď + 600 až 3 000 €“ (5. 11. 2026, Jano, povolil nasadiť naostro)
- `assets/js/profil-data.js` `skupina()`: horúca je po novom aj „Kedy: hneď“ a „Rozpočet: 600 až 3 000 €“ (len hneď,
  nie do 3 mesiacov). Doteraz bola vlažná. Ostatné kombinácie bez zmeny (tabuľka overená v node).
- Skupinu počíta server a stránka ide podľa odpovede, stará verzia súboru v prehliadači nevadí.
- Overené: náhľad (TEST_REZIM) 4 kombinácie, hneď + 600 až 3 000 € ide na `/profil-rezervacia` s termínmi;
  naostro priamy POST `team+skupina-5-11@shapelesai.com` → `horuci`, značky plan-test + plan-horuci, karta v lead
  magnete, potom kontakt aj karta zmazané (2 h čakanie workflowu horúcich sa nestihlo spustiť).
- **Doplnené v ten istý deň (Jano):** rozpočet od 3 000 € je horúci pri akejkoľvek odpovedi „Kedy“ („pri takom rozpočte
  nezáleží, kedy chcú začať“). Vlažná je teraz len „hneď“ alebo „do 3 mesiacov“ bez horúcej kombinácie.
  Overené náhľadom (5 kombinácií) a naostro (`team+skupina2-5-11@…`, „inšpirujem sa“ + 3 000 až 8 000 € → horuci), zmazané.
  Doterajšie leady, ktoré by po novom boli horúce kvôli rozpočtu: 2 (…yxYCXg, …Upj2GJ), nemenené.
- Doterajšie: z 26 leadov majú kombináciu hneď + 600 až 3 000 € 3 (…wVfBON, …E7VHB4, …OTfoIP). Dostali plán e-mailom ako vlažné,
  nemenené. Telefón nemajú (formulár ho nepýta), dá sa im poslať len e-mail s pozvánkou, ak Jano povie.

## Kontrola lead magnetu Miriam (5. 11. 2026, Jano): stránka na webe
- **Platí táto:** https://www.miriamczompoly.sk/kontrola-planu-cu9r5c (noindex, nikde neodkazovaná). Miriam nemá
  Claude, preto obyčajná stránka. Jano chcel len časti plánu, bez konfigurátora a bez e-mailov: 6 otázok, 7 miestností
  (prvá veta, fotky pred a po, veta pod nimi), 6 problémov, 5 viet o nábytku, 6 pocitov, záver. Pri každej políčko,
  na konci 3 otázky (inak poňať, nová časť, nová otázka) a Odoslať. Rozpísané ostane v prehliadači.
- `functions/api/kontrola.js`: poznámky idú ako POZNÁMKA na Miriamin kontakt `UQbUlsXxUiimaBoVuMHQ` v GHL
  („KONTROLA PLÁNU: poznámky od Miriam, dátum“, po častiach do 4 000 znakov), prečítané späť. Kľúč v stránke
  (len proti spamu), bez neho 403. TEST_REZIM nič nezapíše.
- Overené: náhľad (14 fotiek, koncept po obnovení, skúšobné odoslanie), naostro jedna poznámka v GHL, potom zmazaná.
- Stránku generuje skript mimo repa z `assets/js/profil-data.js`. Keď sa texty plánu zmenia, treba ju pregenerovať.
- Prvý pokus, artifact s poznámkami v claude.ai (nižšie), sa nepoužije: Miriam nemá účet.

### Pôvodne: artifact s poznámkami (nepoužije sa)
- Stránka https://claude.ai/artifact/BCmkSiTcswLhZbJb2CHNcQ („Kontrola Plánu od Miriam“): ukážka plánu s výberom
  4 odpovedí, časti plánu (miestnosti, 6 problémov, nábytok, pocity, koniec), otázky a všetkých 21 e-mailov a SMS.
  Pri každej z 33 šablón poznámky. Pri každej je napísané, kto text písal (Miriam alebo my).
- Poznámky sú v databáze stránky, kolekcia `poznamky` {sablona, nazov, text, autor, kedy}. Číta ich ArtifactData `list`.
  Zapisovať môže vlastník a človek pozvaný e-mailom ako Editor, ale len kým stránka nie je zdieľaná verejným odkazom.
  Bez účtu sa poznámky uložia v prehliadači a pošlú sa tlačidlom Skopírovať všetky poznámky.
- Stránku generuje skript mimo repa (texty plánu z `profil-data.js`, správy z generátora prehľadu správ). Po zmene textov ju treba pregenerovať a publikovať na tú istú adresu.

## „Studená“ a „Kedy chce začať“ v konzole (5. 11. 2026, Jano)
- Skupina „ostatná“ sa pri ľuďoch volá **studená**: karta v Príležitostiach, blok otázok v rozhovore, štatistika Lievik
  a poznámka kontaktu v GHL (nové leady majú „skupina: studená“, staršie „ostatni“, konzola číta oboje).
  🔴 Značka v GHL ostáva `plan-ostatni` a kód v D1 `ostatni`: spúšťa sekvenciu 72d7be00, premenovanie by ju zastavilo.
- **Kedy chce začať** vedľa rozpočtu: v zozname konverzácií, v hlavičke rozhovoru, na karte v Príležitostiach
  (Začať, Rozpočet) a v okienku termínu v Kalendári (Chce začať, Rozpočet). Z poľa `plan_odpovede` (5. a 6. odpoveď).
- **Kalendár konzoly nemal kalendár „Hovor k plánu (10 min)“** (`Mrfqa49pMQPuVyba2nqm`), hovory horúcich by Miriam
  nevidela. Doplnený napevno ako posledný (farba k4), do otváracích hodín a kroku mriežky sa nepočíta. Termín sa
  ukáže v každej bunke, do ktorej zasahuje (10-minútový hovor v 15-minútovej mriežke). Overené na Janovom teste 29. 10.

## Na spustenie treba (stav pred 28. 10.)
1. Jano a Miriam prejdú náhľad a texty e-mailov (šablóny vyššie).
2. Publikovať workflowy a urobiť jeden ostrý test na vlastnom čísle a e-maile.
3. Zlúčiť vetvu do `claude/lievik-checklist`, nasadiť `./nasad-web.sh`, zmeniť `noindex` podľa toho, či ide aj do Googlu.
4. Meranie a pixel (stránky zatiaľ neposielajú udalosti do konzoly ani do Meta) a reklama na `/profil`.

## Videá od Miriam (26. 10.)
Miriam poslala nové videá, časť na reklamu a časť na VSL, neoznačené. Jano ich dáva inému AI na kontrolu a strih.
Prompt a kontext preň (kto je Miriam, lievik, presné zadanie videí 1 a 2 z 15. 10., pravidlá reklám, staršie skripty,
formát výstupu A až I): https://claude.ai/artifact/JL44cPSUqJAwnviftmAYZ6 . Text sem nekopírovať.
Na reklamné videá k lead magnetu Miriam žiadne zadanie nedostala. Výsledok kontroly ešte nemáme.

## Otvorené
- Kúpeľňa: niektoré kroky sedia horšie (lampa do rohu, záclony po zem, presunúť veľký kus nábytku, vankúše). Jano sa pýtal prečo,
  vysvetlené 12. 10. v chate. Kým sa nerozhodne, ostávajú Miriamine texty bez zmeny.
- E-mail s plánom dostanú vlažní a ostatní hneď; horúci až po hovore, alebo po dni, ak si hovor nerezervujú.

## 7. 11. 2026: Miriamine poznámky z kontrolnej stránky (odoslané 6. 11. 15:07)

Prišli ako poznámka na Miriamin kontakt v GHL. Jano: „áno zapracuj, zrkadlo nechaj“. Naostro 7. 11., overené v prehliadači (plán, formulár, e-mail s plánom).

- **Miestnosti:** prvá veta „V tvojej … by som ako prvé riešila toto:“ a pod fotkami Miriamin popis realizácie (obývačka, kuchyňa, detská, predsieň, pracovňa, kúpeľňa).
- **Pracovný kút je teraz Pracovňa** (kľúč `kut` v adrese ostáva kvôli odoslaným odkazom). Nové fotky: pred `vidiecky-pracovna-pred.jpg` (Vidiecky byt IMG_8485, regály a ružové závesy), po `vidiecky-po.jpg` (modrá sedačka).
- **Veselosť je teraz Ľahkosť** (kľúč `veselost` ostáva). Odseky všetkých 6 pocitov prepísané podľa Miriam.
- **Je tam tma:** kroky 1 a 2 podľa Miriam, krok 3 (zrkadlo) ostáva.

Otvorené:
- **Spálňa:** Miriam chce ako „pred“ fotku s ružovou spálňou. Nenašla sa (Drive Miriam aj náš, Gmail, médiá GHL, fotky z chatu). Kým nepríde, ostáva stará fotka aj stará veta, lebo jej nová veta hovorí o ružových stenách.
- **Kuchyňa:** Miriam chce iný záber „pred“ (na čelnej stene polica, nie hodiny). Nenašiel sa. Jej nová veta pod fotkami už platí, fotka zatiaľ stará.

## 7. 11. 2026: konzola, rozklikávacie karty a testovacie e-maily

- **Príležitosti:** celá karta je tlačidlo a otvorí detail (na telefóne zdola cez celú šírku). V detaile je kontakt (telefón na ťuknutie, e-mail, adresa s mapou), čo vyplnila (skupina ako farebný štítok, odpovede pod sebou, tlačidlo na jej plán), termíny, údaje karty a poznámky. Dole Presunúť a Zobraziť chat, hore vpravo krížik. Hore namiesto popisu „Ťukni na kartičku, aby si ju otvorila.“ Nové volanie `/api/karta` vo workeri konzoly (tag sa overuje znova ako pri `/api/sprava`). Overené naostro na 1280 px aj na iPhone 13.
- **E-maily lead magnetu:** všetkých 10 (plán, horúca 1 a 2, potvrdenie hovoru, po hovore, sekvencia 1 až 3, potvrdenie diagnostiky doma a online) odišlo Janovi na kontrolu cez GHL na jeho kontakt `z297q1TbLHIBHZ31S0Il`, s ukážkovými údajmi (Lucia, obývačka, tma) a predmetom „TEST n/10: …“. Všetky bez chyby doručenia.

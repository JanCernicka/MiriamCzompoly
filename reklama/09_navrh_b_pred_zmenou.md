# Návrh B: magnet „Pred veľkou zmenou“ (12. 11. 2026)

Jano 12. 11.: ideme návrhom B (Miriamin magnet z PDF z 8. 11., ďalší krok nové rozloženie izby za 400 €).
Texty žijú v artifactoch, sem ich nekopírovať.

| Čo | Kde |
|---|---|
| Stránka (náhľad, nič neodosiela) | https://pred-zmenou.miriam-web-staging.pages.dev/pred-zmenou , súbor `pred-zmenou.html` na vetve `claude/navrh-pred-zmenou` |
| Video: čo nahrať (14 videí prvej dávky s textom a obrazom), 2 telá, 30 úvodov, video na stránku a k úvodnému hovoru, text reklamy | https://claude.ai/artifact/8XwuPSqa92KVJTmexGGbur |
| E-maily: E1 až E5 pre všetkých, H1 a H2 pre horúcich, časový plán | https://claude.ai/artifact/57se9wwQWbfZkKezEVFX9Y |
| Predošlý návrh s tromi cestami | https://claude.ai/artifact/E66UautZsMQ9vjWmWDkkUK |

## Stránka
- 5 otázok doslova z PDF, verzia A až D podľa prvej otázky. `?verzia=a..d` existuje, ale reklamy ho nepoužijú: všetky idú na tú istú stránku bez predvyplnenia (Jano 12. 11.), v adrese len `utm_content=PZ-<kód úvodu>`.
- Horúci/vlažní/studení podľa pravidiel z PDF. Telefón sa ukáže len horúcim.
- Kroky, ktoré podľa tretej otázky už má za sebou, sú označené ako hotové: pravidlá sú NÁVRH, potvrdiť s Miriam.
- Vety o čase pre „3 až 6 mesiacov“ a „neskôr“ sú náš návrh, prvá je z PDF.
- Príbehy klientok: A Štajnerka, B byt pre staršiu pani, C Vidiecky byt, D garsónka Hlohovec (overiť, či bola na prenájom).
- „Len jedna miestnosť“ posiela na plán na víkend (`/profil`).
- Draft je zámerne mimo `plan-naostro`, aby ho `./nasad-web.sh` nevyniesol na www.

## Cesta po otázkach (Jano 12. 11. vybral jemnú variantu 1)
| Kto | Kam | Súbor na vetve `claude/navrh-pred-zmenou` |
|---|---|---|
| horúci | výber času úvodného hovoru (10 minút), telefón, e-mail predvyplnený, priamy kontakt na Miriam | `pred-zmenou-hovor.html` |
| vlažní a studení | ďakovná stránka: hlavná veta, interiérová diagnostika (premena, postup, recenzie, 290/250 €), tlačidlo „Chcem vedieť viac“ = značka záujmu a e-mail Z1 | `pred-zmenou-dakujem.html` (varianty 2 a 3 zrušené 13. 11.) |
| všetci, odkaz z e-mailu | celé poradie krokov bez predaja | `pred-zmenou-poradie.html` |
| Miriam na kontrolu | e-maily E1 až E5, H1, H2, Z1 | `pred-zmenou-emaily.html`, https://pred-zmenou.miriam-web-staging.pages.dev/pred-zmenou-emaily |

Spoločné dáta (otázky, verzie A až D, krátke kroky, pravidlá teploty, výstup poradia): `assets/js/pred-zmenou-data.js`.
Názov služby „Izba podľa teba“ je pracovný, Miriam vyberá.

## Miriam 13. 11. (PDF „Kampaň pred zmenou: môj názor“)
- **Služba za 400 € zrušená.** Dispozícia jednej izby je v jej balíku „Miestnosť, ktorá konečne funguje“ od 1 090 €, a kto robí novostavbu alebo celú prerábku, nikdy nerieši jednu izbu.
- **Diagnostika ostáva** vstupom do oboch kampaní: 90 minút doma alebo online, písomné zhrnutie do 3 dní, 290 € doma, 250 € online, do 25 km od Trnavy cesta v cene, pri projekte sa odpočíta. Všade podnadpis „90-minútová konzultácia u teba doma alebo online“.
- **Bezplatný hovor = „úvodný hovor“**, nie konzultácia, a nie je to poradenstvo: len či a ako vie pomôcť. Texty stránky s hovorom, H1 a H2 sú jej.
- E3a e-book len pri novostavbe, ostatní príbeh klientky (vety doplní sama). E4 jej pôvodný text. E5 a Z1 jej text.
- Rozpočet: väčšinu do „pred zmenou“, víkendovú kampaň nechať s menším rozpočtom. Rozhoduje Jano, v Mete nič nezmenené.
- Video (13. 11.): Scarcity v oboch telách a PS v texte reklamy prepísané na úvodný hovor (predtým „prejdem ho osobne cez telefón“). Odkazy bez predvyplnenia. Pribudla sekcia Čo nahrať a návrh videa k úvodnému hovoru.
- Zapracované 13. 11. na vetve `claude/navrh-pred-zmenou`. Navyše sme upravili predmet a prvý odsek H1 a nadpis stránky s hovorom („Povedzme si, či ti viem pomôcť“), lebo v nich ostalo prejdenie poradia, čo je podľa nej už poradenstvo. Na posúdenie.

## Otvorené
- Miriam: vety o klientkach v E3b, video k úvodnému hovoru, potvrdiť úpravy H1 a nadpisu stránky s hovorom.
- My: kalendár diagnostiky na tlačidlá, kód EBOOK19 a platba 19 €.
- Video: overiť faktá pri P2 až P8, N1 (90 cm), M3. Vyrobiť AI premenu Štajnerky (P3).
- Stránka /diagnostika na webe nemá presne podnadpis „90-minútová konzultácia u teba doma alebo online“ (H1: „Interiérová diagnostika na mieste: za 90 minút vieš, čo s tvojím priestorom.“). Nemenené, beží na nej A/B test.
- Po výbere: správa pre Miriam do WhatsAppu na odsúhlasenie.

## Naostro 16. 11. 2026 (Jano: „už to normálne daj do GHL-ka… čo odsúhlasila, to odsúhlasila“)
Prehľad pre Jana (stránky, investičný byt, časový plán, všetkých 11 e-mailov): https://claude.ai/artifact/FbuzYGg2tZTfavo6hsW766
Inštrukcie na videá pre druhý chat (14 videí prvej dávky, video nad otázkami a k hovoru, text reklamy): https://claude.ai/artifact/4Mnc1mjvJuXCEvG7jMcdBY . V prvej dávke je nový úvod PZ-P9 (investičný byt, Miriamin text 16. 11.) namiesto PZ-P3 Štajnerka, ktorá čaká na potvrdenie.

Stránky sú na www (`/pred-zmenou`, `-dakujem`, `-hovor`, `-poradie`) bez náhľadových pruhov a bez miest na video. Videá na stránku zatiaľ nie sú, sekcia sa vráti, keď ich Miriam nahrá.

**Web → GHL**
| Kde | Čo robí |
|---|---|
| `functions/api/zmena.js` | kontakt s poľami `pz_odkaz`, `pz_krok1`, `pz_hlavna`, `pz_odpovede`, značky `pz-lead`, `pz-<teplota>`, `pz-<teplota>-<verzia>`, poznámka s odpoveďami a reklamou, karta v lead magnete, hneď E1 |
| `functions/api/zmena-zaujem.js` | „Chcem vedieť viac“: `pz-zaujem` + `pz-zaujem-<teplota>-<verzia>` (alebo `pz-zaujem-iba`) |
| `functions/api/zmena-hovor.js` | úvodný hovor v kalendári krátkych hovorov, `pz-hovor`, karta Krátky hovor, potvrdenie SMS a e-mailom, SMS Miriam |
| `functions/_lib/pz.js` | id polí, značky, text E1 (Miriamin, doslova) |

Pixel Lead: na nasledujúcej stránke cez `body[data-fb-event]` (príznak `pz-lead` v sessionStorage), len raz a len po súhlase s cookies.

**GHL šablóny** (9, „Pred zmenou: … (Claude)“): H1 `6afb39df5973f95b07afe640`, H2 `6afb39e121faac6f200d6171`, E2 `6afb39e34c28808e5219e924`, E3 prerábanie `6afb39e431e0f04d2fa862a4`, E3 sťahovanie `6afb39e64c28808e5219e9e3`, E3 investičný `6afb39e831e0f04d2fa86329`, E4 `6afb39e94c28808e5219ea83`, E5 `6afb39eb31e0f04d2fa86395`, Z1 `6afb39edf303b8cc00796826`.

**GHL workflowy** (23, zverejnené, „Pred zmenou: … (Claude)“)
- 12 hlavných, spúšťač `pz-<teplota>-<verzia>`. Horúci: 2 h (len 8 až 20 h) H1, 1. deň H2, 3. deň E2, 5. E3, 7. E4, 9. E5. Vlažní: 1., 3., 5., 7. deň E2 až E5. Studení: 3., 7., 14., 21. deň.
- 8 záujmových, spúšťač `pz-zaujem-<vlazny|studeny>-<verzia>`: Z1 hneď, potom E2 až E4 v tých istých dňoch, **bez E5**. `pz-zaujem-iba`: len Z1.
- `pz-zaujem` vyradí z 8 hlavných vlažných a studených (`c325a781`). `pz-hovor` vyradí zo všetkých 20 (`3e34a950`).
- Všetkých 20 je aj v zozname STOP `d0e8c056` (odpoveď na e-mail, rezervácia diagnostiky, hovor z plánu). Zoznam má teraz 29 workflowov, spúšťače nezmenené.
- E3 pre novostavbu (A): od 16. 11. večer E3a `6afb3cc2810e1cdd00a01bd9` „Kým podpíšeš preberací protokol“, tlačidlo na FAPI https://form.fapi.cz/?id=729f3fc7-48f0-4672-9a34-e0478e139e9c (19 €, len bankový prevod). Vymenené v 5 workflowoch verzie A (3 hlavné, 2 záujmové).
- 🔴 Kód EBOOK19 (E3a sľubuje, že pri diagnostike odpočíta 19 €) nie je nikde v systéme: FAPI nákup sa do GHL nezapíše a pri rezervácii diagnostiky nie je pole na kód. Miriam ho musí odpočítať ručne.

**Investičný byt na webe**: dlaždica „Byt na prenájom“ a okno `#cs-investicny` v Realizáciách (10 fotiek z Miriaminho Drive, pôdorys len pred). `main.js` otvára okno z adresy (`/#cs-starsia-pani`, `/#cs-vidiecky`, `/#cs-investicny`), na to vedú tlačidlá „Pozrieť celú premenu“ v E3 a na stránke s poradím.

**Ostrý test 16. 11. 17:20** (team@, vlažná, prerábanie, „Chcem vedieť viac“): značky, polia, poznámka aj E1 sedia, Z1 odišiel z workflowu o 6 s. Neoverené: či `pz-zaujem` naozaj vyradil z hlavnej sekvencie (17. 11. má team@ dostať E2 **raz**, nie dvakrát). Rezervácia úvodného hovoru otestovaná len na náhľade (naostro by odišla SMS Miriam).

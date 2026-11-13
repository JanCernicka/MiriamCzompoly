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

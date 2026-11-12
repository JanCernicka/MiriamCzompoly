# Návrh B: magnet „Pred veľkou zmenou“ (12. 11. 2026)

Jano 12. 11.: ideme návrhom B (Miriamin magnet z PDF z 8. 11., ďalší krok nové rozloženie izby za 400 €).
Texty žijú v artifactoch, sem ich nekopírovať.

| Čo | Kde |
|---|---|
| Stránka (náhľad, nič neodosiela) | https://pred-zmenou.miriam-web-staging.pages.dev/pred-zmenou , súbor `pred-zmenou.html` na vetve `claude/navrh-pred-zmenou` |
| Video: 2 telá, 30 úvodov, prvá dávka 14, video na stránku, text reklamy | https://claude.ai/artifact/8XwuPSqa92KVJTmexGGbur |
| E-maily: E1 až E5 pre všetkých, H1 a H2 pre horúcich, časový plán | https://claude.ai/artifact/57se9wwQWbfZkKezEVFX9Y |
| Predošlý návrh s tromi cestami | https://claude.ai/artifact/E66UautZsMQ9vjWmWDkkUK |

## Stránka
- 5 otázok doslova z PDF, verzia A až D podľa prvej otázky, `?verzia=a..d` ju predvyplní (reklama podľa situácie).
- Horúci/vlažní/studení podľa pravidiel z PDF. Telefón sa ukáže len horúcim.
- Kroky, ktoré podľa tretej otázky už má za sebou, sú označené ako hotové: pravidlá sú NÁVRH, potvrdiť s Miriam.
- Vety o čase pre „3 až 6 mesiacov“ a „neskôr“ sú náš návrh, prvá je z PDF.
- Príbehy klientok: A Štajnerka, B byt pre staršiu pani, C Vidiecky byt, D garsónka Hlohovec (overiť, či bola na prenájom).
- „Len jedna miestnosť“ posiela na plán na víkend (`/profil`).
- Draft je zámerne mimo `plan-naostro`, aby ho `./nasad-web.sh` nevyniesol na www.

## Cesta po otázkach (Jano 12. 11. vybral jemnú variantu 1)
| Kto | Kam | Súbor na vetve `claude/navrh-pred-zmenou` |
|---|---|---|
| horúci | výber času 10-minútového hovoru, telefón, e-mail predvyplnený, priamy kontakt na Miriam | `pred-zmenou-hovor.html` |
| vlažní a studení | ďakovná stránka: hlavná veta, Izba podľa teba za 400 € (premena, postup, recenzie), tlačidlo „Chcem vedieť viac“ = značka záujmu a e-mail Z1 | `pred-zmenou-dakujem.html` (varianty 2 a 3 cez `?varianta=`) |
| všetci, odkaz z e-mailu | celé poradie krokov bez predaja | `pred-zmenou-poradie.html` |
| Miriam na kontrolu | e-maily E1 až E5, H1, H2, Z1 | `pred-zmenou-emaily.html`, https://pred-zmenou.miriam-web-staging.pages.dev/pred-zmenou-emaily |

Spoločné dáta (otázky, verzie A až D, krátke kroky, pravidlá teploty, výstup poradia): `assets/js/pred-zmenou-data.js`.
Názov služby „Izba podľa teba“ je pracovný, Miriam vyberá.

## Otvorené
- Miriam: potvrdiť texty e-mailov (E3b doplní vlastné vety), dni dodania variantov, odpočet 400 € z projektu, e-book 19 €.
- Video: overiť faktá pri P2 až P8, N1 (90 cm), M3.
- Po výbere: správa pre Miriam do WhatsAppu na odsúhlasenie.

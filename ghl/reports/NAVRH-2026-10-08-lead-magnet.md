# Návrh: lead magnet „Pocitový profil domova“ (8. 10. 2026)

Interný návrh pre Jana (s Hormozim, číslami a výpočtami): https://claude.ai/artifact/KdZW2mfqNvj7iPA4aXZyfv
Verzia pre Miriam (bez Hormoziho a interných čísel, ukážka profilu, 6 profilov, kroky na víkend): https://claude.ai/artifact/MQ9GxqMR1bm99cfRiW69Wo
Správa pre Miriam je v internom návrhu. Zásady v nej idú ako naše skúsenosti, stylistka ako príklad z podobného odboru,
Miriam má sama navrhnúť 2 až 3 magnety. Tu sú len fakty okolo. Text návrhu sem nekopírovať.

## Prečo
Podľa videa Hormozi a Ashley (YouTube nrounb8NlFQ). Rovnaká diera ako u Ashley:

| | Ashley | Miriam |
|---|---|---|
| Vstup | 1 800 klikov (Google) | 489 návštev diagnostiky (D1, od 26. 9.) |
| Výsledok | 8 predajov | 2 rezervácie, Roman zatiaľ nezaplatil |
| Pomer | 0,4 % | 0,4 % |

Lievik od 26. 9. (D1 `udalosti`, počet `sid`):
- `pristal`: 489
- `kalendar-videl`: 111
- `klik-cta`: 15
- `termin-rezervovany`: 2

Meta, kampaň `120250318272510477` od spustenia: 129,84 €, 684 klikov, 7 pixel leadov.

## História
- Stará kampaň `120240594772700477` „Leady na 15min konzultáciu“: 717,39 €, 5 024 klikov.
- CRM audit 23. 7. (`step1-subaccount.md`), 21 príležitostí:
  - 12 sa zaseklo po rezervácii bezplatnej konzultácie
  - 4 zaplatili konzultáciu za 190 €
  - 2 začali prerábku

Bezplatný hovor sám o sebe teda nefungoval. Návrh v artifacte vysvetľuje, čím sa nový postup líši.

## Návrh v skratke
Test na 2 minúty, 10 obrazoviek:
- 5 osobných otázok (pocit, miesto, dôvod, svetlo, podlaha)
- 4 kvalifikačné otázky (fáza, termín, rozpočet, lokalita)
- kontakt

Výsledok na obrazovke dostane každý. Kvalifikovaní navyše pozvánku na 20 minút s Miriam. Ostatní dostanú profil e-mailom, 5 e-mailov a ponuku online diagnostiky.

Čo sa stane s existujúcimi magnetmi:
- E-book 5 chýb: obrázky „robíš toto?“ do reklám a obsah e-mailov. Beží ďalej, kým nebude test.
- Zošit Ako začať: príprava po objednaní diagnostiky.

## Otvorené (stav k 8. 10.)
- Jano sa ešte nerozhodol, nič nie je odsúhlasené ani postavené. Ďalší krok je rozhovor s Miriam.
- Od Miriam treba:
  - 6 profilov a 12 paliet
  - 5 viet o podlahe
  - 18 krokov na víkend
  - hranicu pre rozhovor a svoju kapacitu
  - formu rozhovoru
  - 3 videá
- Rozhodnúť, či ideme proti playbooku. Playbook má kvíz s 3 otázkami bez kvalifikácie, tento test kvalifikuje.
- Rozhodnúť, či Meta bude optimalizovať na dokončený test.
- Spustenie: nové reklamy, prepnúť a 2 až 3 týždne porovnávať s číslami vyššie. Stránka `/diagnostika` ostáva.
- Ak má návrh vidieť Miriam, treba verziu bez sekcie „Len pre nás“ a bez výpočtov.

## Zmena 8. 10. večer: kvalifikovaní idú na rezerváciu (Jano)
- Kvalifikovaní profil nedostanú. Uvidia stránku „Pozriem sa na tvoje odpovede a pripravím ti riešenie“, svoje odpovede a kalendár 20-minútového hovoru. Profil dostanú len ostatní.
- Test má 6 otázok: pocit, miesto, dôvod, svetlo, kedy (aj „zatiaľ sa len inšpirujem“), rozpočet. Preč sú „kam ti pošlem“, „kde bývaš“, fáza (zlúčená s „kedy“) a podlaha.
- Rozpočty (Jano): do 600 € (urobím si sama), 600 až 3 000, 3 000 až 8 000, prémiová prerábka na kľúč nad 8 000, zatiaľ neviem.
- Pravidlo: „len sa inšpirujem“ alebo do 600 € = profil. „Hneď“ alebo „do 3 mesiacov“ = rezervácia. „Tento rok“ = rezervácia len od 3 000 €. Overené na všetkých 20 kombináciách.

## Lieviky (náhľad, nie naostro)
- Vetva `claude/profil-lievik`, nasadené `./nasad-web.sh profil`:
  - test: https://profil.miriam-web-staging.pages.dev/profil
  - rezervácia: https://profil.miriam-web-staging.pages.dev/profil-rezervacia?p=pokoj&m=obyvacka&d=tma&s=tma&k=3m&r=600-3000
  - profil: https://profil.miriam-web-staging.pages.dev/profil-vysledok?p=pokoj&m=obyvacka&d=tma&s=tma&k=inspiracia&r=do600
- Súbory: `profil.html`, `profil-rezervacia.html`, `profil-vysledok.html`, `assets/css/profil.css`, `assets/js/profil-*.js`, `functions/api/rozhovor.js`, `functions/api/profil.js`, `functions/_lib/profil.js`; `/api/sloty?typ=rozhovor` číta kalendár `ZSPaMWEuejcfthaFxKZt` (uvítací hovor).
- Overené: obe cesty preklikané na mobile (390 px), bez vodorovného posúvania a bez chýb v konzole. Na náhľade sú voľné časy skutočné, rezervácia aj e-mail vracajú úspech bez zápisu.
- Na spustenie chýba:
  - vlastný kalendár hovoru (ten z uvítacieho hovoru má workflow s inými SMS)
  - potvrdenie a pripomienka
  - polia na odpovede v GHL
  - e-mail s profilom a séria tipov
  - meranie v konzole a pixel
  - Miriamine texty a farby
- `/api/rozhovor` a `/api/profil` naostro vracajú 503.
- Kontakt sa v teste nepýta. Slabé leady bez e-mailu nám nezostanú. Dá sa doplniť e-mail na obrazovku s rozpočtom.

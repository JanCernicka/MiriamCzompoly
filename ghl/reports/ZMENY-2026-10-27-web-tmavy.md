# Web podľa návrhu Miriam (27. 10. 2026), naostro

Podklad: Miriamin dokument „Návrhy na úpravu webu“ z 27. 10. (8 bodov), Jano: „uprav podľa toho web, ktorý je live“.
Nasadené `./nasad-web.sh` na www.miriamczompoly.sk, vetva `claude/lievik-checklist`.

## Čo je hotové
- **Tmavá téma** len na úvode a službách: `assets/css/tmava.css`, načítaná po `style.css`. Farby presne z návrhu,
  nič iné. Pasca: `style.css` používa `--ink` ako tmavé pozadie a `--paper` ako text na ňom, `tmava.css` každé také
  miesto prepisuje. Hlavné tlačidlo zlaté #DDC16A s textom #1E1B1A, karty cenníka #241F1E s rámom #6E5F43,
  najčastejšia karta a „Od kľúčov po nasťahovanie“ so zlatým rámom, štítok NAJČASTEJŠIE nad rámom, bez tieňov,
  menšie medzery v realizáciách, text 18 px a riadkovanie 1,7. Logo `assets/img/logo-zlate.png` (prefarbené logo.png).
- **Art deco rám strany**: `body::after` v `tmava.css`, 26 px, na mobile 14 px, rohy 26 px zlaté. Hlavička má väčší
  horný odstup, aby linka nešla cez logo.
- **Sekcia Môj podpis** za Realizáciami (pred Recenziami a O mne), texty od Miriam, podpis „Miriam Czompoly“.
  Striedanie pozadí sekcií pod ňou posunuté o jednu.
- **Podpis pri O mne**: „Miriam Czompoly“ zlatou, zatiaľ náhradným písmom Cormorant italic.
- **Svetlé stránky na čítanie** (blog, e-book 5-chyb, GDPR): `assets/css/citanie.css`, zlatá #856A44.
- **Blog späť** na pôvodných adresách z GHL: `/blog` a `/post/<slug>` (svetlo, kombinovanie, kombinovanie-8452,
  prv-byt). Texty z GHL API (`/blogs/posts/{id}?locationId=`, blog `asmtOBEcHYJHccsfM5jd`), prevedené na čisté HTML,
  dlhé pomlčky prepísané, zabudnuté „C“ na konci článku prv-byt vynechané. Blog je v menu na úvode, službách, GDPR
  a e-booku. `/blog/*` a `/post` vedú na zoznam, sitemap doplnená. Nový článok v GHL sa sám neprenesie.

## Čo sa zámerne nemenilo
- `/diagnostika` (A aj B), `/dakujem`, `lievik-checklist/`, lievik plánu: biele pozadie (pravidlo z 23. 9.)
  a bežiaci A/B test. Nenačítajú `tmava.css`, nemajú ani Blog v menu.

## Čaká na Miriam
1. Hlavná fotka s medenými svietidlami: v dokumente „posielam v prílohe“, ale príloha neprišla.
2. Tri fotky detailov do Môj podpis a ku každej nadpis a jedna veta. Miesto je pripravené ako komentár v `index.html`,
   štýl oblúkových fotiek (`.podpis-fotky`) je v `tmava.css`.
3. Písmo Simple Serenity Script je platené (Set Sail Studios). Treba súbor s licenciou na web, alebo podpis ako
   PNG/SVG v #DDC16A a #856A44. Potom `--font-podpis` v `tmava.css`.
4. „Zrušiť svetlý rám okolo fotky“: zrušená svetlá žiara okolo hlavnej fotky. Ak myslela niečo iné, doplniť.

## Mimo webu
- Bublina chatu je widget GHL (`69fca8895b108d17d66edd1c`), farba sa nastavuje v GHL v nastaveniach chat widgetu.
  Dnes je #DCBD68 s bielou ikonou, návrh chce #DDC16A s ikonou #1E1B1A.

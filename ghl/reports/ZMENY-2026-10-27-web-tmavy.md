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

## 12. 11. 2026: Diagnostika z menu webu tmavá
Jano: úvod a služby sú tmavé, Diagnostika A aj B biele. Rozhodol: „z menu tmavá, z reklám biela“.
- Nová stránka `/interierova-diagnostika` (`interierova-diagnostika.html`): kópia `diagnostika.html` (varianta A) s `tmava.css`,
  zlatým logom a Blogom v menu, canonical na seba, v sitemap. Nemá A/B test ani meranie lievika (tie vstrekuje len `functions/diagnostika.js`).
- Všetky odkazy na diagnostiku z webu (úvod, služby, blog, články, GDPR, 5-chyb) vedú na ňu.
- Reklamy, e-maily, lievik plánu a `/dakujem` ostávajú na bielej `/diagnostika` s A/B testom.
- `tmava.css`: tmavý kalendár (`html .kalA`) a lišta „Nevieš, ako začať?“ (`html .navod`). `html` pred triedou je nutné,
  lebo `kalendar.css` a `navod.css` sa načítajú až po `tmava.css`.
- 🔴 Pri zmene textu na `/diagnostika` zmeniť aj `interierova-diagnostika.html`, sú to dve kópie.
- Overené naostro: obe tmavé adresy 200, telo aj kalendár tmavé, `/diagnostika` A aj B biele, menu úvodu vedie na tmavú.

## 13. 11. 2026: Blog a e-book 5 chýb tmavé, nový e-book
Jano: stránka 5 chýb a blog nie sú prerobené do tmavej, a vymeniť knižku za tú, ktorú poslala Miriam.
- `blog.html`, `post/*.html`, `5-chyb.html`: za `citanie.css` načítajú `tmava.css` (farby) a zlaté logo. Svetlá ostala len GDPR.
- `5-chyb.html`: texty podľa nového e-booku (názov „Prečo tvoj byt nefunguje“, 5 kapitol a bonusový test).
  Formulár je z GHL (iframe) s bielym pozadím napevno, preto je karta okolo neho biela (`.optin-card--ghl`).
- Úvod: odkazy na e-book s novým názvom. Päta všetkých tmavých stránok: „E-book 5 chýb“ (na `/diagnostika` a `/dakujem` nemenené).
- Nový e-book: `ghl/ebook/5-chyb-preco-tvoj-byt-nefunguje.pdf` (Miriamin PDF, 11 strán). Ten istý súbor aj na starých adresách
  `ghl/ebook/5-najdrahsich-chyb.pdf` a `lievik-sutaz/assets/5-najdrahsich-chyb.pdf`, aby staré odkazy dávali novú knihu.
- GHL: workflow „E-book 5 chýb: doručenie hneď (Claude)“ `99f4f6d0` (spúšťa formulár `geA4rea6TYWIKcskupXQ`) mal odkaz na starý PDF
  v médiách GHL (`d68c8922…pdf`). Zmenený len odkaz na nový PDF a názov knihy v texte, overené čítaním späť, ostáva published.
  Predmet „Tu je tvojich 5 najdrahších chýb“ nemenený. Záloha pred zmenou v scratchpade sedenia (`zaloha/wf-99f4f6d0.json`).
- Custom value „Link ebook PDF“ ostala na starom PDF (zápis cez API neprešiel). Používa ju len WF1 `71f69ec4`, ktorý je draft.

## Čaká na Miriam
1. ~~Hlavná fotka~~ hotové 27. 10.: `assets/img/hero-medene-svietidla.jpg` (853x1280, poslal Jano).
2. Tri fotky detailov do Môj podpis a ku každej nadpis a jedna veta. Miesto je pripravené ako komentár v `index.html`,
   štýl oblúkových fotiek (`.podpis-fotky`) je v `tmava.css`.
3. Písmo Simple Serenity Script je platené (Set Sail Studios). Treba súbor s licenciou na web, alebo podpis ako
   PNG/SVG v #DDC16A a #856A44. Potom `--font-podpis` v `tmava.css`.
4. „Zrušiť svetlý rám okolo fotky“: zrušená svetlá žiara za fotkou a svetlé pozadie `.ph`, ktoré presvitalo
   na zaoblených rohoch ako tenký lem. Ak myslela niečo iné, doplniť.

## Mimo webu
- Bublina chatu je widget GHL (`69fca8895b108d17d66edd1c`), farba sa nastavuje v GHL v nastaveniach chat widgetu.
  Dnes je #DCBD68 s bielou ikonou, návrh chce #DDC16A s ikonou #1E1B1A.

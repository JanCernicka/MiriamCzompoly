# Skript: diagnostika + dispozičné riešenie za 400 € (28. 9. 2026)

Celý skript (core, 17 vybraných hookov a subhookov, zábery), verzia 3: https://claude.ai/artifact/6xurwQ5pdNnMT2S82RG94m
Zdroj textov na úpravu: artifact, nie tento súbor (aby sa nerozišli dve kópie).

Ponuka: diagnostika 90 min u klientky doma + dispozičné riešenie jednej miestnosti,
2 až 3 varianty s odôvodnením. Samostatne 249 € + 300 € = 549 €, v kampani 400 €.
Dispozícia sama (300 €) sa inak ponúka ako upsell po diagnostike, v reklame nie je.

Stavba podľa `playbook/03_kreativa/SKRIPT_SABLONA.md`: jedno core (133 slov) pre všetky videá,
30 pevných párov hook a subhook v troch skupinách (A chyby z e-booku, B „neviem sa rozhodnúť“,
C dispozícia), videá 61 až 69 s pri 145 slovách na 60 s.
Verzia 2 (Jano, 28. 9.): cena len 400 € a až na konci pred CTA 2 (bez 549 €), v CTA 1 hovor
zdarma na 20 minút pre nerozhodnuté, ako bonus e-book „5 najdrahších chýb“ pre obe cesty.
Stránka kampane teda potrebuje kalendár 400 €, menšiu voľbu hovoru zdarma a e-book po
zanechaní kontaktu (existuje `5-chyb.html`, `ghl/ebook/5-najdrahsich-chyb.pdf`).

Otvorené, overiť s Miriam pred natáčaním:
- hovor zdarma: volá Miriam, koľko týždenne zvládne; B9 (za 20 min povie, či nábytok alebo dispozícia) a B5 (často jedna izba) overiť
- varianty „od jednoduchších po odvážnejšie“, teda aspoň jeden bez búrania
- garancia pre 400 € a jej znenie pri platbe vopred (FAPI, viď testy/fapi/README.md)
- kapacita dispozícií mesačne (v texte zatiaľ „päť“ ako príklad) a „dni premýšľania“
- „viac ako pätnásť rokov praxe“ (web: od roku 2010)
- C10 len so skutočným pôdorysom zo zákazky a súhlasom klientky
- termín dodania variantov (na stránku, nie do videa)

## Verzia 3 (Jano, 28. 9.)
- začiatok ponuky „Ako ti s tým pomôžem?“ namiesto „Práve teraz robím niečo, čo si nenechaj ujsť“
  (náhradné: „Preto som spojila dve svoje služby do jednej.“, „Mám pre teba riešenie.“)
- CTA 1: hovor zdarma na 15 minút (kalendár uvítacieho hovoru), ostatné bloky schválené
- vybrané hooky: A1, A2, A4, A8, A9, A10, B1, B2, B5, B7, B9, B10, C5, C6, C8, C9, C10 (17 videí,
  60 až 67 s, core 130 slov); v B9 a B10 čas zmenený na 15 minút

## Návrh stránky kampane (28. 9. 2026)
Vetva `claude/dispozicia-navrh`, **len cvičný web**: https://dispozicia.miriam-web-staging.pages.dev/dispozicia
(náhľad má `TEST_REZIM=1`, rezervácia sa len simuluje).
- `dispozicia.html`: kostra varianty B (pruh, nadpis, podnadpis, video, veta, CTA, recenzie, ponuka,
  kalendár, pás fotiek, záver). Video zatiaľ miesto, cena 400 € až v ponuke. Žlté „overiť“ = otvorené body vyššie.
- `assets/css/dispozicia.css`, `assets/js/dispozicia*.js`: kópie z varianty B, rezervácia s `ponuka: "dispozicia"`.
- `api/termin.js`: pri `ponuka: "dispozicia"` značka `dispozicia-400-lp`, zdroj „Dispozícia 400 €, stránka“, príležitosť 400 €.
- Platba zatiaľ nie je (produkt FAPI za 400 € neexistuje), po rezervácii ide na `/dakujem`.

## Vyskakovacie okno „Nie si si istá?“ (Jano, 1. 10. 2026), len cvičný web
- Po 15 s na stránke (Jano 1. 10., pôvodne 30 s; počíta len čas s otvorenou kartou), raz za návštevu, nie počas vypĺňania
  rezervácie ani po odoslaní. Na mobile sa vysunie zdola, je nad lištou cookies (z-index 500 > 400).
- Text: „Môžem ti zavolať na 15 minút a budeš mať jasno. Nechaj mi len krstné meno a číslo,
  zavolám ti do 24 hodín.“ Polia: krstné meno, telefón. Pixel: `Contact`.
- `assets/js/zavolaj.js`, CSS `.zavolaj*` v `dispozicia.css`, `functions/api/zavolaj.js`: kontakt podľa
  telefónu, značka `zavolaj-mi-24h`, úloha pre Miriam „Zavolať do 24 h“ s termínom +24 h, príležitosť
  vo fáze „Lead“ (len ak otvorenú nemá).
- GHL: workflow „Zavolaj mi do 24 h: upozornenie pre Miriam (Claude)“ `12ea5601-d6f3-41cc-9d3b-c168cbc2549d`,
  DRAFT, spúšťač značka `zavolaj-mi-24h` (neaktívny): SMS a e-mail Miriam s menom a číslom.
  Zapnúť až so stránkou naostro.
- 🔴 „do 24 hodín“ musí Miriam dodržať, aj cez víkend.

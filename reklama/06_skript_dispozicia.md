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

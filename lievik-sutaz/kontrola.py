#!/usr/bin/env python3
"""Kontrola pred nasadením NA OSTRO. Ticho nie je úspech: čo chýba, vypíše a skončí chybou.

Spusti: python3 lievik-sutaz/kontrola.py
Na .pages.dev sa smie nasadzovať aj s chybami (je to náhľad), na doménu nie.
"""
import pathlib, re, sys

koren = pathlib.Path(__file__).parent
chyby = []

index = (koren / "index.html").read_text(encoding="utf-8")
m = re.search(r'class="vsl-spust"[^>]*data-src="([^"]*)"', index)
if not m or not m.group(1).strip():
    chyby.append("index.html: video nie je doplnené (data-src na .vsl-spust je prázdne)")

dak = (koren / "dakujem.html").read_text(encoding="utf-8")
m = re.search(r'data-bonus-video data-src="([^"]*)"', dak)
if not m or not m.group(1).strip():
    chyby.append("dakujem.html: video ponuky nie je doplnené (data-src na [data-bonus-video] je prázdne)")

for f in sorted(koren.glob("*.html")):
    t = f.read_text(encoding="utf-8")
    if 'data-test="1"' in t:
        chyby.append(f"{f.name}: zapnutý testovací režim (data-test=\"1\"), formulár nič neodosiela")
    n = t.count('class="doplnit"')
    if n:
        chyby.append(f"{f.name}: {n}x DOPLNIŤ v texte")
    if "\u2014" in t or "\u2013" in t:
        chyby.append(f"{f.name}: dlhá pomlčka v texte")
    datumy = set(re.findall(r'data-uzavierka="([^"]+)"', t))
    if len(datumy) > 1:
        chyby.append(f"{f.name}: viac rôznych uzávierok {datumy}")

js = (koren / "functions/api/sutaz.js").read_text(encoding="utf-8")
m = re.search(r'Date\.parse\("([^"]+)"\)', js)
if m and f'data-uzavierka="{m.group(1)}"' not in index:
    chyby.append("functions/api/sutaz.js: UZAVIERKA sa nezhoduje s data-uzavierka v index.html")

if chyby:
    print("NIE JE PRIPRAVENÉ NA OSTRO:")
    for c in chyby:
        print("  -", c)
    sys.exit(1)
print("OK: pripravené na ostro")

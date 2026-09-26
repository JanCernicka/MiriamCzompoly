# Lievik: súťaž o 1 000 € (optin)

**Náhľad:** https://miriam-sutaz.pages.dev (vývoj, `noindex`, reklama sem smerovať nesmie)

Postavené podľa `playbook/04_funnel/STRUKTURA_LANDING_PAGE.md` v GHLtool: mobil 390 x 700
ako východisko, 6 prvkov nad ohybom, video sa nesťahuje pred kliknutím, 3 tlačidlá na
`/dotaznik`, 3 otázky (e-mail, meno, telefón). Text je z Miriamino skriptu k videu.

```
/            landing: banner s odpočtom, nadpis, podnadpis, video, veta, tlačidlo
             recenzie (3, zvýraznená 1 veta), výhra, 4 body, darček, pravidlá, výzva
/dotaznik    e-mail -> meno -> telefón
             po e-maile POST /api/sutaz {krok:"email"}  -> tag sutaz-1000-zacala
             po telefóne POST /api/sutaz {krok:"hotovo"} -> tag sutaz-1000-prihlasena
/dakujem     potvrdenie + PDF „5 najdrahších chýb“ na stiahnutie
             (sem neskôr príde stránka s ponukou pre prihlásených)
```

🟡 **Testovací režim je ZAPNUTÝ** (Jano 26. 9.): `data-test="1"` na `<html>` v troch
stránkach. Dotazník prejde až na `/dakujem`, ale na `/api/sutaz` nič neodošle a vpravo
dole je štítok „TEST: nič sa neodosiela“. Vypína sa odstránením `data-test="1"`,
`kontrola.py` ho na ostro nepustí.

Nasadenie: `./nasad.sh`. Kontrola pred ostrým spustením: `python3 kontrola.py`.

## Namerané 26. 9. (390 x 700)
- Tlačidlo v hero končí na 560 px, všetkých 6 prvkov je nad ohybom, rezerva 140 px.
- Pred kliknutím na video sa nestiahne žiadny videosúbor.
- Žiadny vodorovný posun (šírka stránky 390 px).

## Dátumy
Na jednom mieste: `data-uzavierka` a `data-vyhlasenie` na `<html>` v každej stránke
a `UZAVIERKA` vo `functions/api/sutaz.js` (kontrola.py stráži, že sa zhodujú).
Uzávierka streda 14. 10. 2026 o 20:00, vyhlásenie štvrtok 15. 10. o 18:00.
Po uzávierke banner povie pravdu, tlačidlá sa vypnú a funkcia prihlášky odmietne.

## Otvorené
- **Video**: vložiť URL do `data-src` na `.vsl-spust` v `index.html`. Hostovať v GHL
  médiách (Cloudflare má limit 25 MB a nevracia 206). Pomer sa mení cez `--pomer`.
- **Pravidlá, 3x DOPLNIŤ**: kde sa vyhlási výherca, ako sa vyberá, pre akú oblasť
  projekt platí. Nevymýšľal som.
- **Video recenzia**: playbook ju chce ako prvý dôkaz, Miriam žiadnu nemá.
- **GHL**: projekt nemá secrets `GHL_API_KEY` a `GHL_LOCATION_ID`, formulár zatiaľ
  vracia `not_configured` a ukáže chybovú hlášku. Workflowy na tagy ešte neexistujú
  (e-mail s PDF, SMS/e-mail pre Miriam, sekvencia pre nedokončené).
- **Pixel**: zámerne vypnutý. Rovnaký pixel optimalizuje živú kampaň na diagnostiku
  podľa udalosti Lead, testovacie prihlášky by jej miešali dáta. Pri spustení súťaže
  použiť inú udalosť (napr. CompleteRegistration) a doplniť cookie lištu.
- **Doména**: pred reklamou presunúť na subdoménu miriamczompoly.sk.

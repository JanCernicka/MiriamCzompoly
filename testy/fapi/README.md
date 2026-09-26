# Test platby FAPI na /diagnostika (26. 9. 2026)

Prehľad pre Jana (snímky, odporúčanie, čo rozhodnúť): https://claude.ai/artifact/AGLmNuGZ1o3J3j6FBJFsRe

Živý test: https://miriam-fapi-test.pages.dev (projekt `miriam-fapi-test`, noindex).
Tri stránky: `/vlozene`, `/tlacidlo`, `/navrh`. Termíny ukážkové, do GHL nejde nič.
🔴 Formulár FAPI je ostrý: jeho odoslanie založí u Miriam skutočnú objednávku.

Fakty z formulára FAPI `33a88ecd-b33c-4a70-ab01-7f490ad088c0`:
- produkt „90 minutová konzultácia s interiérovou dizajnérkou“, 249 €, neplatca DPH
- platba iba bankovým prevodom, karta vypnutá; pixel nenastavený; odstúpenie 14 dní
- vkladá sa priamo do stránky (nie iframe), polia `email, phone, first_name, last_name,
  street, city, zip, country, notes` sa dajú predvyplniť (overené, `test.js`)
- telefón treba poslať s +421, inak ho FAPI zamietne

Otvorené: rozhodnutie Jana a Miriam (garancia „nefakturujem“, A/B test beží, karta, texty WF3).

Úprava: `python3 postav.py`, potom `npx wrangler pages deploy dist --project-name=miriam-fapi-test --branch=main`.

## Rozhodnutie Jana (26. 9.): A tlačidlo, B platba ako 3. krok

Vetva `claude/platba-fapi`, **NIE JE naostro**. Náhľady:
- A: https://platba.miriam-web-staging.pages.dev/diagnostika?ab=a, tlačidlo na `/dakujem?ab=a`
- B: https://platba.miriam-web-staging.pages.dev/diagnostika?ab=b (B z `platba.miriam-diagnostika-b.pages.dev`)

Ako to je spravené:
- `functions/dakujem.js`: pod nadpis vloží platbu podľa varianty. A (aj bez varianty) tlačidlo
  na FAPI v novom okne, B formulár FAPI v stránke. Lead pixel a `termin-rezervovany` ostávajú na `/dakujem` pre obe.
- `assets/js/platba.js`: predvyplní FAPI z `sessionStorage.mc_platba` (ukladá ho `b.js` pred presmerovaním).
  FAPI sa po načítaní prekreslí a zmaže telefón aj poznámku, preto sa vpisuje opakovane.
- B pýta navyše priezvisko a PSČ (faktúra), `api/termin.js` ich zapíše do GHL (`lastName`, `postalCode`).
- A: v krokoch pri kalendári „Zaplatíš 249 € a ozvem sa ti pred stretnutím“.
- `api/krok.js`: pri nastavenom `TEST_REZIM` (náhľady) do D1 nezapisuje, inak by skúšanie išlo do A/B testu.

Náhľad `miriam-web-staging` (preview premenné, platia pre všetky náhľadové vetvy): `TEST_REZIM=1`
(rezervácia z B sa len simuluje), `VARIANTA_B=https://platba.miriam-diagnostika-b.pages.dev`.

Pred spustením naostro: text garancie „nefakturujem“ na A aj B, text potvrdenia vo WF3, nová verzia
vo `VERZIE` konzoly (platba mení počet rezervácií). Naostro: B `--branch=main`, web `./nasad-web.sh`.

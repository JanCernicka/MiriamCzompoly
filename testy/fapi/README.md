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

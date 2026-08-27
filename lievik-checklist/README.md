# Lievik: checklist pred preberaním bytu

Zbieranie e-mailov z Instagramu. Vlastná stránka, vlastný formulár, napojené na GHL
cez API. Nie GHL iframe.

**Živé:** https://miriam-checklist.pages.dev

```
Instagram (komentár TERMIN)  ->  DM s odkazom
        │
        ▼
 miriam-checklist.pages.dev          vlastná stránka + vlastný formulár
        │  POST /api/prihlasit       e-mail + kedy preberá byt
        ▼
 Cloudflare Pages Function           🔴 jediné miesto, kde žije PIT
        │  POST /contacts/upsert
        ▼
 GHL kontakt + tagy                  checklist-developer + preberam-*
        │
        ├─ tag `checklist-developer` ->  WF-A: pošli checklist hneď
        └─ tag `preberam-do-3m`      ->  WF-B: o 3 dni ponuka platenej služby
```

---

## 🔴 Čo ešte nie je hotové

Systém je postavený, ale **nie je zapojený do GHL**. Kontajner, v ktorom sa to stavalo,
sa recykloval a prístupy do GHL sa stratili. Chýbajú tri veci:

| Krok | Ako |
|---|---|
| 1. nastaviť PIT | `printf '%s' "$GHL_API_KEY" \| npx wrangler pages secret put GHL_API_KEY --project-name=miriam-checklist` |
| 2. nastaviť location id | `printf '%s' "$GHL_LOCATION_ID" \| npx wrangler pages secret put GHL_LOCATION_ID --project-name=miriam-checklist` |
| 3. postaviť workflowy | `python3 ghl/build_workflows.py` (najprv `--dry-run`) |

⚠️ Pri kroku 1 už raz prebehol zápis **s prázdnou hodnotou**. Treba ho prepísať,
nie iba pridať.

Kým to nie je hotové, formulár vráti `{"ok":false,"error":"not_configured"}` a na
stránke sa ukáže chybová hláška. **Zámerne. Radšej hlasná chyba než ticho stratený lead.**

### Ako overiť, že to funguje

```bash
curl -X POST https://miriam-checklist.pages.dev/api/prihlasit \
  -H 'Content-Type: application/json' \
  -d '{"email":"test+checklist@tvoja-adresa.sk","timing":"do-3-mesiacov"}'
# očakávaj {"ok":true,"contactId":"..."}
```

Potom v GHL over, že kontakt má **oba** tagy a že mu odišiel e-mail.
Workflowy sú po vytvorení **draft**, kým sa nepublikujú, neodíde nič.

---

## Súbory

| Cesta | Čo to je |
|---|---|
| `index.html` | stránka, formulár aj odosielanie |
| `assets/css/style.css` | vizuál prevzatý z miriamczompoly.sk |
| `assets/checklist-preberanie-bytu.pdf` | lead magnet, 8 strán |
| `functions/api/prihlasit.js` | Pages Function, jediné miesto s PITom |
| `ghl/build_pdf.py` | generuje PDF zo zdrojového markdownu |
| `ghl/build_workflows.py` | tagy, dve e-mailové šablóny, dva workflowy |
| `ghl/checklist-zdroj.md` | text checklistu od Miriam, obsahovo nemenený |

---

## Rozhodnutia a prečo

**Vlastný formulár, nie GHL iframe.** GHL widget je iframe, do ktorého sa nedostane
naše CSS. Tu je formulár súčasťou stránky, takže vyzerá presne ako zvyšok.

**Meno nezbierame.** Miriam chcela iba e-mail. Preto v žiadnom e-maile nesmie byť
`{{contact.first_name}}`, vyrenderovalo by sa ako „Ahoj ,".

**Segmentácia je tag, nie vetvenie.** Odpoveď „kedy preberáš byt" sa premietne do tagu
a ten spúšťa druhý workflow. `if_else` je krehké a nepotrebujeme ho.

**Dva workflowy namiesto jedného.** WF-A dostane každý, WF-B iba segment do 3 mesiacov.

**Bez čakania pred prvým e-mailom.** Stránka sľubuje checklist hneď, tak ide hneď.
Dvojminútová poistka je na workflowy spúšťané presunom karty v pipeline, nie sem.

**PDF je na Cloudflare, nie v GHL knižnici.** Jedno miesto, jedna doména, plná kontrola.
Ak sa doména zmení, treba prepísať `BASE` v `ghl/build_workflows.py` a znova uložiť
e-mailovú šablónu.

**Pasca na roboty.** Formulár má skryté pole `website`. Keď je vyplnené, Function
odpovie `ok` a nič nezapíše.

---

## Čo ešte treba rozhodnúť

- **Cena platenej služby.** Druhý e-mail ju zámerne neuvádza a končí vetou
  „odpíš a pošlem ti podrobnosti aj cenu". Číslo som si nevymýšľal.
- **Vlastná doména** namiesto `pages.dev`. Na odkaz z Instagramu to stačí, na reklamu nie.
- **Meta pixel.** Na stránke nie je. Ak sa má budovať publikum na neskoršiu reklamu,
  patrí sem, ale je to otázka súhlasu podľa GDPR.
- **Čo s tými, čo odpíšu na e-mail.** Momentálne to nikto nesleduje automaticky.

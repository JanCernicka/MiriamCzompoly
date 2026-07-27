# KROK WEB (build) — Web nasadený na staging + napojený na GHL

_Zdroj: AI-vygenerovaný web (z `website-master-prompt.md`), skopírovaný do `client-miriam/website/`, dowiredovaný na živý GHL účet `o86atLjsdR9IoUTWgYna` a nasadený na Cloudflare Pages._

## ✅ Živý staging
- **URL:** https://miriam-web-staging.pages.dev
- Cloudflare Pages projekt: `miriam-web-staging` (deploy cez `npx wrangler pages deploy`).
- Overené HTTP 200: `/` (home), `/diagnostika`, `/5-chyb`.
- Clean-URL správanie (`.html` → 308 na bezextenzný tvar) = štandard Cloudflare Pages.

## ✅ 3 stránky (obsah = presné znenie zo `step6c-website-copy.md`)
| stránka | čo obsahuje |
|--|--|
| `index.html` | domov, plná dĺžka (11× h2): hero · problém („Máš pekné veci, no domov to stále nie je“) · „Vieš, že je čas, keď…“ · **#sluzby** value ladder (249 € diagnostika · miestnosť **od 1 090 €** · kompletná premena **od 3 900 €** featured · na kľúč **od 8 000 €** banner) · garancie („Riziko beriem na seba“) · **#proces** ako to prebieha · **#realizacie** reálne premeny · **#recenzie** (Iveta, Dimová) · **#o-mne** Kto som · lead-magnet opt-in · FAQ · finálne CTA. „Takto som pomohla [meno]“ klikateľné modaly (5×). |
| `diagnostika.html` | predaj 249 € diagnostiky + rezervačný kalendár |
| `5-chyb.html` | lead-magnet landing s opt-in formulárom |

## ✅ Napojenie na GHL (živé ID)
- **Kalendár** „Interiérová diagnostika“ `fUjAzOhv2VyiY3XTguPz` → iframe `widget/booking/…` na `diagnostika.html` (+ CTA tlačidlo smeruje naň).
- **Formulár** „5 chýb (lead magnet)“ `geA4rea6TYWIKcskupXQ` → iframe `widget/form/…` na `5-chyb.html`. Mock formulár odstránený.
- Home opt-in form → `action="5-chyb.html"` (posunie na landing s reálnym GHL formulárom).
- **Portrét Miriam** = reálna fotka z GHL media library (`…/media/69e7d02403c24196d247704c.png`) v sekcii O mne.

## ✅ Reálne fotky z GHL media library (12 slotov)
Prešiel som celú media library (106 súborov, vizuálne skontrolované — nie podľa názvov) a namapoval reálne fotky:
| slot | fotka |
|--|--|
| Hero (domov) | svetlá obývačka, rybinová podlaha |
| Tile „Premena obývačky“ | tehlová stena + kožené kreslá |
| Tile „Premena spálne“ | podsvietené čelo postele |
| Tile „Premena kuchyne“ | dubová linka (= „po“ z reálneho páru) |
| Tile „Ďalšia premena“ | obývacia časť domu, drevený strop |
| Tile „Projekt na kľúč“ ×2 | tmavá kuchyňa na mieru · vstupná hala s dizajnovým predelom |
| Modal „Premena jednej miestnosti“ | 🟢 **reálny PRED → PO pár** (tá istá kuchyňa: pôvodná biela linka → dubová linka s pracovným kútom) |
| Modal „Od kľúčov po nasťahovanie“ | „po“ foto (kuchyňa po realizácii) |
| `diagnostika.html` | moodboard s materiálmi a vzorkami |

CSS: pridané `.ph > img` + `.ph.has-img` (fotka vyplní slot cez `object-fit:cover`), `z-index` fix na hero badge „15+ rokov“.

### ⚠️ Zámerne NEVYPLNENÉ (9 slotov) — menné prípadové štúdie
Tiles a modaly **Iveta**, **Rodina Dimová**, **Valentínová** som nechal ako `[B]`. Sú to reálne klientky — priradiť im náhodnú fotku z knižnice by bola **nepravdivá atribúcia** na verejnom webe. Miriam musí povedať, ktorý projekt patrí ku ktorému menu; potom to domapujem za 5 minút.

Rovnako mám len **jeden overený pred/po pár** (kuchyňa). Ostatné fotky sú hotové realizácie — do slotu „Pred“ ich dať nemôžem, lebo by to klamalo.
- **Meta Pixel** snippet vložený pred `</head>` na všetkých 3 stránkach s `fbq('init','__META_PIXEL_ID__')` + `PageView`.

## 🟠 Zostáva ([B] — manuál / rozhodnutie / go-live)
- **Reálne Pixel ID** — nahradiť placeholder `__META_PIXEL_ID__` (príde pri Meta setupe/CAPI).
- **Prípadové štúdie — reálne fotky** do „Takto som pomohla“ modalov (interiér fotky sú v GHL media library, viem dowirovať na pokyn).
- **Doména** — DNS cutover `miriamczompoly.sk` → Cloudflare Pages (dnes ešte starý web).
- **Platba 249 €** pri rezervácii — GHL UI (limit public API).
- Po cutover retirovať starý web funnel + staré kalendáre/formuláre (viď `AUDIT-leftover-old-assets.md`).

## ⚠️ Poznámka k deployu
- Deploy musí ísť s `--branch=main`, inak wrangler vytvorí **preview** deployment a hlavná adresa `miriam-web-staging.pages.dev` ostane na starej verzii.
- V jednej iterácii mi z `index.html` vypadli sekcie (#sluzby, #proces, #realizacie, #recenzie, problém, garancia) — opravené: web prekopírovaný nanovo z originálu a wiring aplikovaný cielene. Overené: served == local na všetkých 3 stránkach.

## Rollback
Zmazať Cloudflare Pages projekt `miriam-web-staging` / zmazať folder `client-miriam/website/`. GHL ID ostávajú (kalendár/formulár sa dajú znovupoužiť).

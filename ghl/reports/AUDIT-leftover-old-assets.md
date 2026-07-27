# AUDIT — staré (old-offer) assety, ktoré som pri Krokoch 1–3 nechal / neauditoval

_Honest audit po otázke „auditoval si všetko?“. Odpoveď: nie — toto sú leftovery zo starej ponuky, ktoré treba reframovať/retirovať, inak sa bijú s novým systémom._

## 🔴 1. Duplicitné/prekrývajúce sa STARÉ published workflowy (riziko double-send)
Postavil som nové WF, ale staré ekvivalenty sú **stále published**. Ak publikujem nové bez vypnutia starých → kontakt dostane OBE.
| Staré (published) | Prekrýva sa s | Akcia |
|--|--|--|
| „Reaktivácia starých kontaktov“ | **WF2** | vypnúť staré pri go-live |
| „Ebook Delivery Slovak Workflow“ | **WF1** | vypnúť / zlúčiť |
| „Po konzultácii“ | **WF4** | vypnúť / prepísať |
| „Pred konzultáciou“ | WF3 (E9) | prepísať copy (viď nižšie) |
| „Pripomienka termínu 2h a 10min pred“ | WF3 (S3/S4) | 🔴 online→osobne, vykanie→tykanie |
| „1/2/3 – Recenzie“ | WF7 | 🔴 odstrániť súťaž, vykanie→tykanie |
| „WebStránka – Telefonická konzultácia potvrdenie termínu“ | starý web funnel | retirovať pri novom webe |
| „WebStránka – Odoslaný formulár bez rezervácie“ (draft) | starý web | ignorovať/zmazať |
| „Reaktivácia databázy“ (draft, staré) | WF2 | zmazať (duplicita) |
| „Facebook Pixel CAPI“ (draft) | meranie | dokončiť pri Mete |

## 🔴 2. Kalendár „Interiérová diagnostika“ — BEZ potvrdzovacej notifikácie
`notifications: []` → kto si rezervuje, **nedostane žiadne potvrdenie** (kým nebeží WF3/E9). Fix: E9 (potvrdenie + príprava) musí prísť z WF3 (alebo zapnúť built-in notifikáciu kalendára s E9 copy).

## 🟠 3. Staré custom values (stále live)
- „Custom Contest Prize = 60min konzultácia (v hodnote 120€) zadarmo!“ → devalvujúca súťaž zo starej ponuky; referencovaná starým review WF. Odstrániť pri prepísaní WF7.
- „Funnel link = miriamczompoly.sk“ → starý; aktualizovať na nový web/diagnostiku.

## 🟠 4. Staré formuláre (stále live)
- „Formulár – 15 min konzultácia“, „Formulár – E-book“, „Form 1“ = stará ponuka; retirovať pri novom webe.
- „Interiérová diagnostika (Claude)“ (`50VILUSCXj7…`) = cudzí/testovací formulár (nie môj „Formulár – 5 chýb“). Overiť s Janom, prípadne zmazať.

## 🟠 5. Staré kalendáre
- 2× „Bezplatná konzultácia…“ (15 min, personal) — stará ponuka + vlastné staré notifikácie. Deaktivovať pri go-live.

## Čo z toho vyplýva (poctivo)
- Kroky 1–3 som spravil **aditívne** (postavil nové), ale **nereconciloval staré**. Pri go-live to treba: (a) vypnúť/prepísať staré prekrývajúce workflowy, (b) dať kalendáru potvrdenie (E9/WF3), (c) vyčistiť staré custom values/forms/kalendáre.
- Preto NEidem na ďalší krok skôr, než toto zreconcilujeme.

## ✅ EXECUTED (tento turn — „free to go“)
- **Unpublikované 7 starých workflowov** (stopnutý double-send + súťaž + online-call/vykanie copy): Reaktivácia starých kontaktov, Ebook Delivery Slovak, Po konzultácii, Pred konzultáciou, 1/2/3 Recenzie. → všetky teraz `draft`.
- **KEPT published** (kvôli súčasným rezerváciám na starých kalendároch, retire pri cutover): „Pripomienka termínu 2h a 10min pred“, „WebStránka – potvrdenie termínu“.
- **Zmazaný** custom value „Custom Contest Prize (120€ zadarmo)“ (už nereferencovaný).
- **Pokus o kalendár confirmation notifikáciu → 422** (schéma cez API neprešla). Nechávam `notifications:[]` a riešim pri cutover (správna schéma / UI / rebuilt WF3). Staré „Pripomienka termínu“ medzitým kryje reminders pre aktuálne rezervácie.

## Zostáva (pri cutover / rozhodnutí)
- Nová appointment confirmation + reminders (E9/S3/S4) na kalendári „Interiérová diagnostika“.
- WF7 recenzie (tykanie, bez súťaže) — postaviť/prepísať; staré sú už vypnuté.
- Retire 2 staré kalendáre + staré formuláre (15 min konzultácia, E-book, Form 1); overiť cudzí „Interiérová diagnostika (Claude)“ formulár.
- „Funnel link“ custom value = ponechaný (platná doména), aktualizuje sa pri novom webe.

## Pôvodne navrhnutý reconciliation
1. Prepísať copy WF3 (Pred konzultáciou + Pripomienka) a WF7 (Recenzie) → tykanie, osobne, bez súťaže, nový kalendár/pipeline. **Klony vs in-place — čaká na tvoje rozhodnutie.**
2. Pri publikovaní nových WF **zároveň vypnúť** staré ekvivalenty (Reaktivácia starých kontaktov, Ebook Delivery, Po konzultácii).
3. Wire E9 potvrdenie na kalendár.
4. Vyčistiť custom values (contest, funnel link), staré formuláre a kalendáre, overiť cudzí „(Claude)“ formulár.

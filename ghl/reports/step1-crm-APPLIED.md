# KROK 1 (build) — CRM: ČO JE UŽ APLIKOVANÉ v živom účte

_Účet `o86atLjsdR9IoUTWgYna`. Vytvorené ID: `client-miriam/data/crm-created-ids.json` (na rollback)._

## ✅ HOTOVO (bezpečné, aditívne, neviditeľné pre klientov, plne editovateľné)
**Custom values (10)** — ceny + linky + scarcity + referral. Ťahajú sa do e-mailov/SMS/webu ako `{{ custom_values.* }}`:
- Cena diagnostika = 249 € · Cena miestnosť = od 1 090 € · Cena kompletná premena = od 3 900 € · Cena na kľúč = od 8 000 €
- Počet projektov mesačne = 3–4 · Referral kredit = 100 €
- Link diagnostika · Link 5 chýb · Link ebook PDF · Link kalendár diagnostika (zatiaľ placeholder URL — prepíšem po nasadení webu/kalendára)

**Tagy (11)** — taxonómia pre workflowy (step6e): lead-magnet, nurture-aktiv, reaktivacia, diagnostika-rezervovana, diagnostika-hotova, ponuka-poslana, klient, no-show, referral-ask, recenzia-ask, odhlaseny.

> Ceny sú „prepared“ hodnoty z plánu — kým klientka neodsúhlasí finál, sú editovateľné jedným PUT-om. Nič z toho nevidí klient ani to nemení Miriamin denný pohľad.

## ✅ HOTOVO — Pipeline „Hlavný predajný proces“ prestavaná (cez nový `pipeline_builder`, public API PUT)
Existujúcich 9 stage-ov **premenovaných + preusporiadaných so zachovaním ID** (žiadna opp sa nestratila) + pridaný nový **LOST** stage. Nový stav a živé počty opps (overené 21/21):
| pos | stage | opps |
|--|--|--|
| 0 | Lead | 0 |
| 1 | Diagnostika rezervovaná | 12 |
| 2 | Diagnostika potvrdená | 3 |
| 3 | Diagnostika zaplatená (249 €) | 2 |
| 4 | Diagnostika absolvovaná | 2 |
| 5 | Ponuka projektu poslaná | 0 |
| 6 | Projekt vyhraný (WON) | 0 |
| 7 | Realizácia | 2 (Dimová, Valentínová) |
| 8 | Recenzia / Referral | 0 |
| 9 | Projekt prehraný (LOST) — NOVÝ | 0 |

- Backup pôvodného stavu: `client-miriam/data/pipeline-backup-preedit.json` (rollback = PUT tohto `stages` array späť).
- Nový LOST stage id: `64b243d5-7829-474f-9392-683c36425010`.
- Drobnosť na ľudské oko: 3 opps v „Diagnostika potvrdená“ a 2 v „Diagnostika zaplatená (249 €)“ pochádzajú zo starých „Potvrdil termín“ / „Zaplatil 190€“ — Miriam nech ich podľa reality prípadne posunie (bezvýznamné, len 5 dealov).
- Pipeline **„Paid Ads“** (nevyužitá, 0 opps) — voliteľne zmazať (`DELETE /opportunities/pipelines/8IzWYbhpOj3sOCHTJt0L`); nechal som ju, poviem na pokyn.

**Won/lost + hodnoty opps** = priebežné pri nových dealoch (poloautomat vo workflowoch), nie jednorazový setup.

## Rollback
Zmazať vytvorené CV/tagy podľa ID v `crm-created-ids.json` (DELETE /customValues/{id}, /tags/{id}).

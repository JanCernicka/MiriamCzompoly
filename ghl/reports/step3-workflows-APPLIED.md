# KROK 3 (build) — Workflowy: APLIKOVANÉ (draft) v živom účte

_Folder: „ShapelessAI – Miriam funnel" (`327fa3cb-4b03-479d-82ad-37167daa6e96`). Všetky **DRAFT** — nič sa neposiela, kým sa nepublikujú._

## ✅ Kompletných 7 z 7

| WF | názov | trigger | kroky | id |
|--|--|--|--|--|
| WF1 | Lead magnet nurture (5 chýb) | **odoslanie formulára** `geA4rea…` | Tag · E1 · S1 · E2 · E3 · E4 · E5 | `71f69ec4-4dfc-4200-9a92-7253ed6ca1da` |
| WF2 | Reaktivácia databázy | tag `reaktivacia` | E6 · S2 · E7 · E8 | `6bf79a65-88c3-499e-b271-9b7f1a0d82e2` |
| WF3 | Pred diagnostikou | **rezervácia termínu** na kalendári | Tag · E9 · S3 · S4 | `e8120656-58f4-498f-95c8-2ca6e67123ef` |
| WF4 | Po diagnostike → ponuka | tag `diagnostika-hotova` | E10 · E11 · E12 · E13 | `51906b42-545d-47c2-9a4f-f59c52a4d883` |
| WF5 | No-show recovery | tag `no-show` | E14 · S5 | `09cf59f6-3f90-4174-a9ae-1c0e8ce92799` |
| WF6 | Referral | tag `referral-ask` | E15 · S6 | `241950bc-dd8f-4102-a17a-986cdf8595de` |
| WF7 | Vypýtanie recenzie | tag `recenzia-ask` | S7 · wait 2 dni · E16 · Tag | `38c27883-bb7f-4b06-80da-78c0393fcb08` |

## WF3 — pripomienky viazané na termín
Nie fixné čakanie, ale **relatívne k času stretnutia** (`type: appointment`, `appointmentCondition: skip`):

| krok | kedy |
|--|--|
| E9 potvrdenie + príprava | ihneď po rezervácii |
| S3 pripomienka | **1 deň pred** termínom (1440 min) |
| S4 pripomienka | **2 hodiny pred** termínom (120 min) |

Ak sa termín presunie, Meta… teda GHL prepočíta čakanie samo. `skip` znamená, že ak je termín bližšie než okno, krok sa preskočí namiesto okamžitého odoslania.

## WF7 — recenzie, prepísané od nuly
Staré workflowy „1/2/3 Recenzie" boli postavené na **súťaži o 120 € konzultáciu zadarmo** a vykali. Nepoužil som z nich nič, WF7 je nový:
- S7 (deň 0) → čakanie 2 dni v pracovnom okne → E16 pripomenutie
- Odkaz ťahá `{{ custom_values.review_google_url }}` (reálny Google review link)
- E16 obsahuje aj **únik pre nespokojné**: „ak niečo nebolo ideálne, napíš rovno mne" → negatívna spätná väzba ide Miriam, nie na Google
- Žiadna súťaž, tykanie
- Finálny krok pridáva tag `recenzia-doziadana` (nový)

> ⚠️ Pri stavbe som mal chybu: posledný krok pridával ten istý tag `recenzia-ask`, ktorý workflow spúšťa → **nekonečná slučka**. Zachytené pri kontrole a opravené pred akýmkoľvek publikovaním.

## Kontrola všetkých 7 (automatická)
Overené: žiadny cyklus, žiadny trigger ukazujúci mimo grafu, 0 dlhých pomlčiek, všetko draft.

## Go-live
1. Publikovať WF1–WF7
2. Napojiť tagovanie: diagnostika hotová → `diagnostika-hotova`; no-show → `no-show`; projekt hotový → `referral-ask` a `recenzia-ask`
3. Vypnúť staré prekrývajúce workflowy (viď `AUDIT-leftover-old-assets.md`)
4. WF2: reálny send až keď 84 kontaktom pridám tag `reaktivacia` (gated na schválenie cien)

## Rollback
`workflow_ops.delete_workflow` na ID vyššie.

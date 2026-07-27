# KROK 6E — WORKFLOWY: presná logika (build blueprint)

_Hotový plán na postavenie v GHL. Odkazuje na správy E#/S# zo step6d a stránky zo step6c. Toto je špecifikácia, ktorú viem [A] postaviť cez GHL interné API. Pipeline = „Hlavný predajný proces“ (nové stage-y podľa step6 §2.1)._

**Nové pipeline stage-y (nastaviť raz):**
`1 Lead → 2 Diagnostika rezervovaná → 3 Diagnostika zaplatená → 4 Diagnostika absolvovaná → 5 Ponuka projektu poslaná → 6 Projekt vyhraný (WON) → 6b Projekt prehraný (LOST) → 7 Realizácia → 8 Recenzia/Referral`

**Tagy (nastaviť raz):** `lead-magnet`, `nurture-aktiv`, `reaktivacia`, `diagnostika-rezervovana`, `diagnostika-hotova`, `ponuka-poslana`, `klient`, `no-show`, `referral-ask`, `recenzia-ask`, `odhlaseny`.

**Globálne pravidlo (do každého workflowu):** ak kontakt ODPOVIE na e-mail/SMS alebo si rezervuje termín → *Remove from all nurture workflows* (aby nedostával automat, keď už komunikuje). GHL: „Remove from Workflow“ + tag `nurture-aktiv` odstrániť.

---
## WF1 — Lead magnet + nurture  (Sekvencia A)
- **Trigger:** Form/Opt-in submitted = „5 chýb“ (stránka /5-chyb).
- **Kroky:**
  1. Add tag `lead-magnet`, `nurture-aktiv`. Create opportunity → stage **1 Lead** (value 249 €, placeholder).
  2. Send **E1** (okamžite).
  3. If phone exists → Wait 2 dni → Send **S1**.
  4. Wait → deň 1: **E2** · deň 3: **E3** · deň 5: **E4** · deň 8: **E5**.
  5. **Goal/branch:** ak si rezervuje diagnostiku (kalendár) alebo odpovie → exit do WF3, remove `nurture-aktiv`.
- **Koniec:** ak po E5 žiadna akcia → tag ostane `lead-magnet`, presun do „dlhý nurture“ (mesačný newsletter, mimo rozsahu teraz).

## WF2 — Reaktivácia databázy  (Sekvencia B)
- **Trigger:** manuálne pridanie tagu `reaktivacia` (spustíme dávkovo na 84 kontaktov + minulých klientov). *Nespúšťať na aktívnych dealoch.*
- **Kroky:**
  1. Send **E6** (9-word, deň 0).
  2. If phone → Wait 1 deň → if no reply → **S2**.
  3. Wait 3 dni → if no reply → **E7**.
  4. Wait 3 dni (spolu +6) → if no reply → **E8**.
  5. **Branch (reply/klik na /diagnostika):** tag `nurture-aktiv`, notifikuj Miriam (interná notifikácia „ozval sa reaktivovaný kontakt“), remove z WF2.
- **Koniec:** bez odozvy → remove `reaktivacia`, ostáva v DB.

## WF3 — Pred diagnostikou  (Sekvencia C)
- **Trigger:** Appointment booked v kalendári „Interiérová diagnostika“.
- **Kroky:**
  1. Move opportunity → **2 Diagnostika rezervovaná**. Tag `diagnostika-rezervovana`, remove `nurture-aktiv` (+ remove z WF1/WF2).
  2. Send **E9** (okamžite, potvrdenie).
  3. Wait until 1 deň pred termínom → **S3**.
  4. Wait until 2 h pred termínom → **S4**.
  5. **Branch platba 249 €** (ak platí online cez GHL): on payment → move **3 Diagnostika zaplatená**.
  6. **Branch appointment status:**
     - `showed` → spusti WF4.
     - `no-show` / `cancelled` → spusti WF5.

## WF4 — Po diagnostike → ponuka projektu  (Sekvencia D)
- **Trigger:** Appointment status = showed (alebo manuálny tag `diagnostika-hotova` po stretnutí).
- **Kroky:**
  1. Move → **4 Diagnostika absolvovaná**. Tag `diagnostika-hotova`.
  2. Send **E10** (okamžite). Move → **5 Ponuka projektu poslaná**, tag `ponuka-poslana`. Interná notifikácia Miriam: „doplň 3 priority do poznámky / potvrď odoslanie“.
  3. Wait 2 dni → if no reply → **E11** (garancie).
  4. Wait 2 dni → if no reply → **E12** (scarcity + case study).
  5. Wait 3 dni → if no reply → **E13** (down-sell / mäkké ukončenie).
  6. **Goal (WON):** ak odpovie „idem do toho“ / podpíše / zaplatí zálohu → move **6 Projekt vyhraný**, tag `klient`, remove z WF4, spusti WF6 (po realizácii). Interná notifikácia.
  7. **LOST:** ak po E13 nič → move **6b Projekt prehraný (LOST)**, ostáva v DB na neskorší re-touch.

## WF5 — No-show recovery  (Sekvencia E)
- **Trigger:** Appointment status = no-show/cancelled (z WF3).
- **Kroky:** Tag `no-show`. Send **E14** (okamžite) → Wait 1 h → **S5**. 
- **Goal:** re-booking → späť do WF3, remove `no-show`.
- Ak 2× no-show → interná notifikácia Miriam (rozhodne, či volať).

## WF6 — Referral  (Sekvencia F)
- **Trigger:** opportunity → stage **7 Realizácia** dokončená (alebo tag `projekt-hotovy`) ALEBO pozitívna recenzia (z review workflowu).
- **Kroky:**
  1. Tag `referral-ask`. Wait 2 dni (nech si užije výsledok).
  2. Send **E15**.
  3. Wait 3 dni → if no reply → **S6**.
  4. **Branch:** ak pošle meno/kontakt kamarátky → interná notifikácia Miriam + vytvor nový lead (stage 1) s tagom „referral“ a poznámkou kto odporučil. Referrerovi priпрav 100 € kredit (manuálne potvrdenie).

## WF7 — Recenzia  (Sekvencia G) — napojiť na existujúce „1–3 Recenzie“
- **Trigger:** opportunity → **7 Realizácia** dokončená.
- **Kroky:** Wait 2 dni → **S7** (Google recenzia link) → Wait 2 dni → if neklikol → **E16**.
  - Pozitívna (klik/hodnotenie ≥4) → spusti WF6 (referral) + existujúce „2 Kliknutý link na recenziu“.
  - Negatívna (≤3 alebo „napíš mne“) → interná notifikácia Miriam (existujúce „3 Negatívna recenzia“), NEposielať verejný link.

## WF8 — (voliteľné) FB CAPI / meranie
- Dokončiť draft „Facebook Pixel CAPI“ workflow: na kľúčové eventy (opt-in, rezervácia, platba 249 €, WON) posielať server-side event do Meta. Rieši „results N/A“ z Kroku 3.
- **[B] potrebné aj na strane Meta:** dataset/pixel ID, access token, mapovanie eventov.

---
## Poradie stavby (odporúčané)
1. Pipeline stage-y + tagy + custom values (ceny, odkazy).
2. **WF2 Reaktivácia** (najrýchlejšia výhra z 84 kontaktov — spustiť hneď po odsúhlasení textov).
3. WF1 Lead magnet + nurture.
4. WF3 + WF5 (pred diagnostikou + no-show).
5. WF4 (po diagnostike → ponuka).
6. WF6 + WF7 (referral + recenzia).
7. WF8 CAPI (s [B] krokmi na Mete).

## Rozdelenie
**[A] Ja:** postavím WF1–WF7 v GHL (interné API), vrátane vloženej copy E#/S#, delayov, vetvení, tagov a pipeline pohybov. Každý workflow ti pošlem na kontrolu textu pred aktiváciou (necháme v Draft, kým neodsúhlasíš).
**[B] Vy/klientka:** odsúhlasiť texty a ceny; doplniť odkazy (PDF, /diagnostika, Google recenzia); napojiť kalendár „Interiérová diagnostika“ a platbu 249 € (GHL Payments); WF8 nastavenia na Mete; rozhodnúť referral incentívu.

> Poznámka: reálne spustenie do živého účtu = až po tvojom „áno“. Postaviť ich viem ako **Draft** (nič sa neodošle), aby ste videli hotové v účte a len klikli Publish.

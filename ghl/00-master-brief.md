# MASTER BRIEF — Miriam Czompoly business reframe (shapelessAI engagement)

> Saved verbatim so every step is reliable. **Do ONE step per prompt. Be thorough. Spend the time.**

## Client
- **Miriam Czompoly** — interior designer (SK). Website: miriamczompoly.sk
- GHL subaccount location ID: `o86atLjsdR9IoUTWgYna`
- Meta ad account: (to be identified in Step 3)

## The core problem (from Jan / shapelessAI)
- She **charges too little**. Offer + whole system must be **reframed to a new, higher-value offer**.
- Emails, SMS workflows, ads, website all need to be **audited and reframed** to the new offer.
- She **lost joy** — even landing clients barely gets her by; she can't afford to pay us.
- **High cost per lead, high cost per closed client, low margins.**
- This is a HUGE task.

## The 6 steps (do ONE per prompt)
1. **[STEP 1]** Study the entire GHL subaccount to understand the business.
2. Study the website miriamczompoly.sk.
3. Study her ads + metrics on Meta.
4. Study all offer materials sent (see /materials).
5. Read the **2 books** cover to cover (⚠ NOT YET RECEIVED — see below).
6. Based on the 2 books, produce solutions for every prior step. **Detailed report in Slovak**: what to change, how, why. Specific complete solutions (workflows, copy, email sequences). Split into: (A) what WE can fix, (B) what client must do manually (e.g. website changes).

## Materials received (in /client-miriam/materials/)
- `navrh-valentinova.pdf` — design proposal "Valentínová" (131 pp) — offer/presentation sample
- `navrh-dimova.pdf` — design proposal "Dimová" (88 pp) — offer/presentation sample
- `kalkulacie-dimova-linky.xlsx` — kitchen-line pricing calculation (Dimová)
- `obsah-prace.docx` — "obsah práce" / scope-of-work doc
- (2 floor-plan/render images pasted in chat — interior design of obývačka/jedáleň/kuchyňa/schodisko/hala)

## Books (received — in /materials)
- `book1-offers.md` — Alex Hormozi, **$100M Offers** (~44.7k words).
- `book2-leads.md` — Alex Hormozi, **$100M Leads** (~68.8k words).
- Step 5 = read both cover to cover; Step 6 solutions must be grounded in these frameworks (Grand Slam Offer, value equation, pricing, guarantees, naming; Lead Getters, lead magnets, core four, referrals, etc.).

## ⚠ OPEN ITEMS / BLOCKERS
- Meta ad account ID not yet confirmed (Step 3).

## Progress log
- [DONE] Connected to subaccount (PIT + location + firebase token in .env, gitignored).
- [DONE] STEP 1 — subaccount studied. Report: `reports/step1-subaccount.md`. Raw data: `data/*.json`.
  - Key: interior designer, Trnava; ~84 contacts / ~15 leads-per-month, ~58% Instagram organic.
  - Offer ladder: ebook/free consult → 190€ paid consult → interior remodel. Full projects billed 435–1785€ (undercharging confirmed).
  - 21 opps ALL "open" (no won/lost, mostly €0) — blind reporting. Leads stall right after booking.
  - Workflows = ops/reminders/reviews only; nurture+sales-conversion missing; key catch workflows in DRAFT (form-no-booking, DB reactivation, FB CAPI).
- [DONE] STEP 2 — website. Report: `reports/step2-website.md`. Site is on LeadConnector/GHL (editable by us). CRITICAL: leftover English woodworking template blocks live on every page. Offer underpackaged, no price anchoring/guarantee/social proof; CTA inconsistent; free-call vs 190€-consult conflict.
- [DONE] STEP 3 — Meta ads. Account 1210955550121224. Report: reports/step3-meta-ads.md; data: data/meta-ads-summary.md.
  - ~€1037 lifetime spend; current campaigns €728 → ~11 booked consults (~€66 ea) → only 2 paid consults + 2 projects. Ad CAC per closed client ~€364 vs project €435-1785 (84% of Dimova revenue).
  - Cheap clicks (CPC €0.03-0.29, CTR 4-13%) — top of funnel fine. Leaks: FREE-consult offer (low intent), BROKEN measurement (results N/A, CAPI in draft), undercharging downstream. Copy angles good, keep them.
- [DONE] STEP 4 — offer materials. Report: reports/step4-offer-materials.md; extracted text data/*-text.txt.
  - Prices by m2 + hourly (input-based) AND far too low. Huge unbounded scope (everything) over 5-18 months.
  - Sells a deliverable ("navrh") not an outcome. Proposals = pure visual decks, ZERO commercial framing (no price/scope/guarantee/next-step).
  - Self-sabotage (her own words): gives AI visuals + detailed consult upfront -> clients self-serve and leave. Valentinova (1785e) fired her mid-project, ordered everything herself.
  - DESIGN BOOK xlsx = done-for-you shopping list, 1313e in products for ONE hall vs 435e design fee.
- [DONE] STEP 5 — read BOTH books cover-to-cover ($100M Offers + $100M Leads). Framework + mapping to Miriam: reports/step5-books-framework.md.
  - Top levers: new Grand Slam Offer (productized, value-priced, guarantee/scarcity/bonuses); fix value equation (TIME + proof); stop giving implementation (AI visual) free; raise LTGP + client-financed acquisition; warm outreach/DB reactivation (9-word email); referral program; unify web/CRM/ads + fix measurement (CAPI, opp values); systematize IG content.
- [DONE] STEP 6 — final SK plan: reports/step6-final-plan.md. New Grand Slam Offer (value ladder: free diagnostic lead magnet -> 249e paid diagnostic -> productized packages 890/3900/8000e+, guarantees, scarcity, bonuses, delivery-model fix). Split [A] I build in GHL (CRM/pipeline/measurement, workflows: DB reactivation, lead-magnet nurture, pre/post-diagnostic, no-show, referral, review; email/SMS copy; web+ad copy) vs [B] manual (present offer+prices to client, change delivery process, collect case studies, rebuild web pages in GHL editor, Pixel/CAPI+launch ads). NOTHING changed in live account yet — awaiting approval of offer+pricing.
- [DONE] STEP 6 add-ons (exact copy-paste solutions, per user request): reports/step6c-website-copy.md (full finished text per section + /diagnostika + /5-chyb pages), step6d-email-sms-copy.md (sequences A-G, every E1-E16/S1-S7 fully written), step6e-workflows-spec.md (WF1-8 exact triggers/delays/branches/pipeline/tags), step6b-ad-structure-10eur.md (1 campaign/1 adset/3 ads + full copy at max 10e/day).
- [NEXT] On approval, build [A] items; recommended first: DB reactivation workflow (WF2).

## Known tooling issue
- CLI `opportunities list` sends `locationId`; GHL API now requires `location_id` (snake_case) → 422. Pulled opps via curl for now. Fix candidate in `gohighlevel_cli.py:311`.

## Notes / style
- Reports for the client-facing deliverable: **Slovak**. Working notes: English ok.
- Keep chat replies brief (Jan's preference). Deep work goes into /client-miriam files.

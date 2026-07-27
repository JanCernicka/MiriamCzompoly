# Master prompt — generovanie celého nového webu Miriam Czompoly (pre AI web builder)

**Ako použiť:** nahraj s týmto promptom JEDEN súbor — `step6c-website-copy.md` premenovaný na **`website-copy.md`**. (Voliteľne 1–2 jej projektové fotky ako style reference — rovnaké pre obe AI, nech je test fér.) Prompt je tool-agnostický (v0 / Lovable / Bolt / Claude / ChatGPT / Gemini).

---

ROLE
You are a world-class conversion-focused web designer and front-end developer. Build a complete, production-ready, award-quality marketing website for a premium interior designer, in a SINGLE pass — all pages, fully responsive, ready to deploy. This is a head-to-head design competition, so make it genuinely beautiful and best-in-class.

SOURCE OF TRUTH (READ FIRST)
The attached file `website-copy.md` contains ALL final copy and the full page/section structure for this website. It is the single source of truth.
- Use the Slovak copy VERBATIM. Do NOT rewrite, translate, shorten, or invent marketing copy. Preserve Slovak diacritics exactly.
- Follow its structure and section order for every page.
- The file uses labels you must honor:
  • `[B: ...]` = content the client will supply later (photos, names, quotes). Render an elegant, clearly-styled PLACEHOLDER (e.g. a captioned image block or a subtle "doplní sa" chip). Never fabricate testimonials, client names, or case studies.
  • `[ODKAZ ...]`, `/diagnostika`, `/5-chyb` etc. = links. Wire them to the correct internal pages/anchors; use `#` for anything still unknown.
  • Price cards, guarantees, scarcity lines, FAQ = keep all of them, styled for emphasis.

PAGES TO BUILD (from the file)
1. Domov (home) — all sections in the file, in order: hero, dôvera pásik, problém, kvalifikácia, Služby (4 price cards), Garancie, Proces, Realizácie (case-study gallery), Recenzie, O mne, lead-magnet opt-in blok, FAQ, záverečné CTA, pätička.
2. /diagnostika — the paid-diagnostic sales page (full copy in file).
3. /5-chyb — the free lead-magnet opt-in page + its thank-you state.
Global: one shared header (nav + primary CTA) and footer on every page.

DESIGN DIRECTION (brand)
Premium, editorial interior-design aesthetic that justifies high prices and feels made for women (her audience). Think high-end studio / architectural digest, not clip-art.
- Palette: warm sophisticated neutrals (cream, sand, warm greige) with deep charcoal and a restrained warm metallic accent (brass/gold). Marble/wood texture accents allowed, used sparingly.
- Typography: an elegant serif display for headlines + a clean modern sans for body. Strong type hierarchy, generous line-height.
- Layout: lots of whitespace, large photography-led sections, calm grid, refined spacing. Mobile-first, flawless on phone, tablet, desktop.
- Imagery: use tasteful placeholder images (interior photography style) wherever the file marks a photo/before-after/case study. Before/after should read clearly as pairs.
- Motion: subtle, tasteful (soft fade/slide on scroll, smooth hover states). No gimmicks.

CONVERSION & UX REQUIREMENTS
- One primary CTA repeated consistently: "Chcem diagnostiku" → /diagnostika. Keep it visually dominant; make it a sticky/persistent header button and repeat it at natural decision points.
- The 4 service cards must make the price anchoring obvious (Diagnostika 249 € → Miestnosť od 1 090 € → Kompletná premena od 3 900 € ⭐ → Na kľúč od 8 000 €). Highlight "Kompletná premena" as the recommended/most popular tier. Guarantees and scarcity ("beriem 3–4 projekty mesačne") must be visible.
- Each service card shows its 1-line proof quote + a small HIGHLIGHTED CLICKABLE TEXT LINK reading "Takto som pomohla [krstné meno] →" (NOT a button — it must not compete with the primary CTA). Clicking it opens the matching case study via a LIGHTBOX/MODAL (before/after gallery + short story). If a modal isn't feasible in your output, link to an anchor in the Realizácie section instead. This is progressive disclosure: cards stay clean, proof opens on demand.
- Case-study modal/section content follows the "Formát jedného case study" template in the file (Nadpis → Pred/Po → Východisko → Čo sme spravili → Výsledok + citát → CTA).
- Lead-magnet opt-in (name + email) on /5-chyb and in the home opt-in block; show the thank-you state described in the file.
- FAQ as an accordion. Testimonials styled as a clean, credible section.

TECHNICAL REQUIREMENTS
- Fully responsive, mobile-first; working mobile hamburger menu.
- Working interactive bits: sticky header, mobile nav, FAQ accordion, case-study modals, form UI (front-end only; no backend needed — forms can be non-functional but must look and validate like real ones).
- Clean semantic HTML, accessible (proper headings, alt text, focus states, sufficient contrast).
- Fast and self-contained: no broken external dependencies. If you use a framework/Tailwind, keep the build runnable as-is; otherwise deliver clean HTML + CSS (+ minimal vanilla JS). Inline or bundle assets so nothing 404s.
- SEO: <title>Interiérový dizajn Trnava — Miriam Czompoly</title>, a Slovak meta description, sensible Open Graph tags, favicon placeholder.
- Slovak language throughout (`lang="sk"`), diacritics intact.

HARD CONSTRAINTS
- Do not invent or embellish any copy, prices, guarantees, testimonials, or client names beyond what `website-copy.md` provides. Where the file has a placeholder, keep it a clearly-styled placeholder.
- Do not remove any section, price card, guarantee, or FAQ item from the file.
- Deliver the ENTIRE site in one response: all 3 pages + shared header/footer, complete and deployable. State any assumption you made in one short note at the end.

GOAL
A polished, premium, high-converting site that makes a €3 900+ interior-design offer feel like an obvious yes — clean enough to scan in 10 seconds, deep enough (via the case-study modals) to convince a serious buyer.

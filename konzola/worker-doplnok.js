/**
 * Doplnok do _worker.js konzoly (projekt konzola-miriamczompoly) pre kartu Lievik.
 * Podľa GHLtool lievik/06_KONZOLA.md, časť 4 a 5, kód z DKP/konzola/_worker.js.
 *
 * Už vložené v konzola/dist/_worker.js a nasadené 26. 9. 2026. Tento súbor ostáva
 * ako samostatný kus na vloženie do inej konzoly z tej istej šablóny.
 *
 * Ako vložiť:
 *   1. tento kód nad `const CESTY = {`
 *   2. do CESTY dva riadky:
 *        "/api/lievik": (env, b) => lievik(env, b),
 *        "/api/ab": (env, b) => abTest(env, b),
 *      🔴 DO zoznamu, nie vedľa neho: iba tak sú čísla za tým istým heslom konzoly.
 *   3. premenná projektu STAT_HESLO (secret), tá istá ako v zberači a na hlavnom webe
 */

/* 🔴 KEDY SA MENIL WEB. Čas je UTC a je to čas NASADENIA. Najnovšia verzia HORE.
 *    KTO PREROBÍ WEB ALEBO ZAPNE A/B TEST, PRIDÁ SEM RIADOK a do prepínača v index.html
 *    voľbu v:<id>. Riadok s ab: true má čas, keď test začal doručovať ľuďom z reklamy. */
const VERZIE = [
  /* A/B delenie 50/50 zapnuté 26. 9. 2026, nasadené 14:29:39 UTC (16:29 miestneho) */
  { id: "diagnostika-ab", nazov: "diagnostika, A/B test (od 26. 9. 16:30)",
    od: Date.UTC(2026, 8, 26, 14, 30), ab: true },
  /* meranie išlo naostro 26. 9. 2026 o 15:28 miestneho času (13:28:38 UTC) */
  { id: "diagnostika", nazov: "diagnostika s meraním (od 26. 9. 15:28)",
    od: Date.UTC(2026, 8, 26, 13, 28) },
];

const ZBERAC = "https://miriam-lievik.pages.dev";
const AB_WORKER = "https://www.miriamczompoly.sk";

async function abTest(env, telo) {
  if (!env.STAT_HESLO) return json({ ok: false, error: "meranie lievika nie je nastavené" }, 501);
  const v = VERZIE.find((x) => x.id === telo.verzia && x.ab) || VERZIE.find((x) => x.ab);
  const dni = Math.min(90, Math.max(1, parseInt(telo.dni || 7, 10) || 7));
  const otazka = v ? `od=${v.od}` : `dni=${dni}`;
  const r = await fetch(`${AB_WORKER}/api/vysledok?heslo=${encodeURIComponent(env.STAT_HESLO)}&${otazka}`);
  const t = await r.text();
  if (!r.ok) return json({ ok: false, error: `web vrátil ${r.status}` }, 502);
  let d; try { d = JSON.parse(t); } catch (e) { d = null; }
  if (!d) return json({ ok: false, error: "web nevrátil JSON" }, 502);
  return json(d);
}

async function lievik(env, telo) {
  if (!env.STAT_HESLO) return json({ ok: false, error: "meranie lievika nie je nastavené" }, 501);
  const v = VERZIE.find((x) => x.id === telo.verzia);
  const dni = Math.min(90, Math.max(1, parseInt(telo.dni || 7, 10) || 7));
  // 🔴 `od` prebíja `dni`; neznáme id padá na dni, nie na chybu
  const otazka = v ? `od=${v.od}` : `dni=${dni}`;
  const r = await fetch(`${ZBERAC}/prehlad?heslo=${encodeURIComponent(env.STAT_HESLO)}&${otazka}`);
  const t = await r.text();
  if (!r.ok) return json({ ok: false, error: `zberač vrátil ${r.status}` }, 502);
  let d; try { d = JSON.parse(t); } catch (e) { d = null; }
  if (!d) return json({ ok: false, error: "zberač nevrátil JSON" }, 502);
  d.verzie = VERZIE.map((x) => ({ id: x.id, nazov: x.nazov, ab: !!x.ab, od: new Date(x.od).toISOString() }));
  d.verzia = v ? v.id : null;
  return json(d);
}

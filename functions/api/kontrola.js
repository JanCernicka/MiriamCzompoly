/**
 * POST /api/kontrola: Miriamine poznámky ku kontrole lead magnetu „Plán od Miriam“ (5. 11. 2026, Jano:
 * „ona Claude AI nemá … stránka, kde budú políčka, ona ich odošle a my to uvidíme v Go High Leveli“).
 *
 * Stránka /kontrola-planu-cu9r5c (nikde neodkazovaná, noindex) pošle {kluc, poznamky:[{sablona, nazov, text}]}.
 * Poznámky idú ako POZNÁMKA na Miriamin kontakt v GHL (MIRIAM_KONTAKT_ID), po častiach do 4 000 znakov.
 * Nič neodchádza e-mailom ani SMS. Kľúč len bráni náhodnému spamu, nie je to tajomstvo (je v stránke).
 * TEST_REZIM=1 (náhľady): nič sa nezapíše, len sa overí obsah.
 */
import { GHL, json, hlavicky, nastavene, MIRIAM_KONTAKT_ID } from "../_lib/ghl.js";

const KLUC = "m8sT3SJqC9YMOgfMqjCW0YEi";
const MAX_POLOZIEK = 80, MAX_TEXT = 4000, MAX_SPOLU = 60000, MAX_CAST = 4000;
const cisty = (v, max) => String(v || "").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  if (!b || b.kluc !== KLUC) return json({ ok: false, error: "forbidden" }, 403);
  if (cisty(b.web, 100)) return json({ ok: true, poznamok: 0 });   // pasca na roboty

  const pz = (Array.isArray(b.poznamky) ? b.poznamky : []).slice(0, MAX_POLOZIEK)
    .map((x) => ({ nazov: cisty(x && x.nazov, 200).replace(/\n/g, " "), text: cisty(x && x.text, MAX_TEXT) }))
    .filter((x) => x.text);
  if (!pz.length) return json({ ok: false, error: "empty" }, 400);
  if (pz.reduce((s, x) => s + x.text.length, 0) > MAX_SPOLU) return json({ ok: false, error: "too_long" }, 413);

  const kedy = new Intl.DateTimeFormat("sk-SK", { timeZone: "Europe/Bratislava", day: "numeric", month: "numeric",
    year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date());
  const bloky = pz.map((x) => `[${x.nazov || "Bez názvu"}]\n${x.text}`);
  // po častiach do MAX_CAST znakov, delí sa len medzi poznámkami (jedna poznámka má najviac 4 000 znakov)
  const casti = [];
  for (const blok of bloky) {
    const posledna = casti[casti.length - 1];
    if (posledna && posledna.length + blok.length + 2 <= MAX_CAST) casti[casti.length - 1] = posledna + "\n\n" + blok;
    else casti.push(blok);
  }
  const hlavicka = (i) => `KONTROLA PLÁNU: poznámky od Miriam, ${kedy}` + (casti.length > 1 ? ` (časť ${i + 1} z ${casti.length})` : "") + "\n\n";

  if (env.TEST_REZIM === "1") {
    console.log("TEST_REZIM: kontrola neuložená", pz.length, "poznámok,", casti.length, "častí");
    return json({ ok: true, test: true, poznamok: pz.length, casti: casti.length });
  }
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);

  const H = hlavicky(env);
  const ids = [];
  try {
    for (let i = 0; i < casti.length; i++) {
      const r = await fetch(`${GHL}/contacts/${MIRIAM_KONTAKT_ID}/notes`, { method: "POST", headers: H,
        body: JSON.stringify({ body: hlavicka(i) + casti[i] }) });
      const d = await r.json().catch(() => ({}));
      const id = (d.note && d.note.id) || d.id;
      if (!r.ok || !id) {
        console.error("kontrola poznámka", r.status, JSON.stringify(d).slice(0, 300));
        return json({ ok: false, error: "ghl_note", ulozene: ids.length, casti: casti.length }, 502);
      }
      ids.push(id);
    }
    // 🔴 200 OK nie je dôkaz, čítať späť
    const spat = await fetch(`${GHL}/contacts/${MIRIAM_KONTAKT_ID}/notes`, { headers: H });
    const sd = await spat.json().catch(() => ({}));
    const naj = new Set(((sd.notes) || []).map((n) => n.id));
    const overene = ids.every((id) => naj.has(id));
    if (!overene) console.error("kontrola: poznámky sa po zápise nenašli", ids.join(","));
    return json({ ok: overene, poznamok: pz.length, casti: casti.length, error: overene ? undefined : "ghl_readback" }, overene ? 200 : 502);
  } catch (e) {
    console.error("kontrola", String(e));
    return json({ ok: false, error: "ghl_unreachable", ulozene: ids.length }, 502);
  }
}

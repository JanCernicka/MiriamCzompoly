/**
 * POST /api/zmena-zaujem: tlačidlo „Chcem vedieť viac“ na /pred-zmenou-dakujem (16. 11. 2026).
 * Značky (16. 11. 2026, workflowy „Pred zmenou: záujem o diagnostiku…“):
 *  pz-zaujem-<teplota>-<verzia>: Z1 („Diagnostika: ako to prebieha“) hneď a potom E2 až E4 bez E5
 *     (Miriam: „Kto ho dostal, E5 už nedostane.“), verzia a teplota sa berú zo značky hlavnej sekvencie
 *  pz-zaujem: vyradí kontakt z hlavnej sekvencie vlažných a studených
 *  pz-zaujem-iba: len Z1, keď kontakt značku sekvencie nemá
 * Len pre kontakt, ktorý už otázky poslal (má pz-lead), inak by ktokoľvek mohol posielať e-maily na cudziu adresu.
 * TEST_REZIM=1: nič sa nezapíše.
 */
import { GHL, json, hlavicky, nastavene } from "../_lib/ghl.js";
import { ZNACKA } from "../_lib/pz.js";

const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const email = cisty(b.email, 254).toLowerCase();
  if (!isEmail(email)) return json({ ok: false, error: "bad_email" }, 400);
  if (env.TEST_REZIM === "1") return json({ ok: true, test: true });
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);

  const H = hlavicky(env);
  try {
    const r = await fetch(`${GHL}/contacts/search/duplicate?locationId=${env.GHL_LOCATION_ID}&email=${encodeURIComponent(email)}`, { headers: H });
    const c = ((await r.json().catch(() => ({}))).contact) || null;
    if (!c || !c.id || !(c.tags || []).includes(ZNACKA.vsetci)) return json({ ok: false, error: "unknown_contact" }, 404);
    const sekv = (c.tags || []).map((t) => /^pz-(vlazny|studeny)-([a-d])$/.exec(t)).find(Boolean);
    const znacky = [ZNACKA.zaujem, sekv ? `pz-zaujem-${sekv[1]}-${sekv[2]}` : "pz-zaujem-iba"];
    if ((c.tags || []).some((t) => t.startsWith("pz-zaujem-"))) return json({ ok: true, uz: true });   // druhé kliknutie nič nepošle
    const tg = await fetch(`${GHL}/contacts/${c.id}/tags`, { method: "POST", headers: H, body: JSON.stringify({ tags: znacky }) });
    if (!tg.ok) { console.error("zaujem značka", tg.status); return json({ ok: false, error: "ghl_tag" }, 502); }
    return json({ ok: true });
  } catch (e) {
    console.error("zaujem", String(e));
    return json({ ok: false, error: "ghl_error" }, 502);
  }
}

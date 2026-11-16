/**
 * POST /api/zmena: koniec otázok na /pred-zmenou (kampaň „Pred veľkou zmenou“, naostro 16. 11. 2026).
 * Rovnaký postup ako /api/profil pri pláne:
 *  1. teplota a verzia podľa Miriaminho PDF (assets/js/pred-zmenou-data.js)
 *  2. upsert kontaktu BEZ značiek (upsert by existujúce značky prepísal), s poľami pz_*
 *  3. e-mail a pole s odkazom prečítať späť (200 OK nie je dôkaz)
 *  4. značky pz-lead, pz-<teplota>, pz-<teplota>-<verzia> samostatným volaním (posledná spúšťa sekvenciu)
 *  5. poznámka s odpoveďami, odkazom a reklamou
 *  6. karta v pipeline vo fáze lead magnet
 *  7. e-mail E1 s poradím krokov hneď všetkým, cez GHL Conversations
 * TEST_REZIM=1: nič sa nezapíše, len sa overia údaje a vráti sa teplota.
 * TEST_REZIM=ghl-bez-sprav: zapíše sa všetko ako naostro, ale E1 neodíde.
 */
import { GHL, json, hlavicky, nastavene, prilezitost, FAZA_LEAD_MAGNET } from "../_lib/ghl.js";
import { PZ, POLIA, polia, znacky, emailE1, poznamka, odkial, NAZOV_TEPLOTY } from "../_lib/pz.js";

const ZDROJ = "Pred veľkou zmenou (/pred-zmenou)";
const ZDROJ_KARTY = "Pred veľkou zmenou";
const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  if (cisty(b.website, 200)) return json({ ok: true, teplota: "studena" });   // pasca na roboty
  const meno = cisty(b.meno, 60), email = cisty(b.email, 254).toLowerCase();
  if (meno.length < 2 || !isEmail(email)) return json({ ok: false, error: "bad_contact" }, 400);
  const o = b.odpovede && typeof b.odpovede === "object" ? { ...b.odpovede, kde: cisty(b.odpovede.kde, 80) } : null;
  if (!o || !PZ.platne(o)) return json({ ok: false, error: "bad_answers" }, 400);
  const teplota = PZ.teplota(o);

  if (env.TEST_REZIM === "1") {
    console.log("TEST_REZIM: poradie neodoslané", teplota, JSON.stringify(o));
    return json({ ok: true, test: true, teplota });
  }
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);

  const base = new URL(request.url).origin;
  const H = hlavicky(env);
  try {
    const up = await fetch(`${GHL}/contacts/upsert`, { method: "POST", headers: H,
      body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, email, firstName: meno, source: ZDROJ,
                             city: o.kde || undefined, customFields: polia(base, o, meno) }) });
    const upd = await up.json().catch(() => ({}));
    const id = upd.contact && upd.contact.id;
    if (!up.ok || !id) { console.error("zmena upsert", up.status, JSON.stringify(upd).slice(0, 300)); return json({ ok: false, error: "ghl_contact" }, 502); }

    // 🔴 200 OK nie je dôkaz, čítať späť
    const c = ((await (await fetch(`${GHL}/contacts/${id}`, { headers: H })).json().catch(() => ({}))).contact) || {};
    if ((c.email || "").toLowerCase() !== email) { console.error("zmena: kontakt sa neuložil"); return json({ ok: false, error: "ghl_readback" }, 502); }
    const odkaz = ((c.customFields || []).find((f) => f.id === POLIA.odkaz) || {}).value;
    if (!odkaz) console.error("zmena: polia pz_* sa neuložili");

    const tg = await fetch(`${GHL}/contacts/${id}/tags`, { method: "POST", headers: H, body: JSON.stringify({ tags: znacky(o) }) });
    if (!tg.ok) console.error("zmena značka", tg.status);

    const nt = await fetch(`${GHL}/contacts/${id}/notes`, { method: "POST", headers: H,
      body: JSON.stringify({ body: poznamka(o, base, meno, `Otázky Pred veľkou zmenou, skupina: ${NAZOV_TEPLOTY[teplota]}, verzia: ${PZ.VERZIE[o.situacia].nazov}. ${odkial(b.utm)}`) }) });
    if (!nt.ok) console.error("zmena poznámka", nt.status);

    await prilezitost(env, id, { faza: FAZA_LEAD_MAGNET, nazov: `${meno} · ${email}`, zdroj: ZDROJ_KARTY });

    if (env.TEST_REZIM !== "ghl-bez-sprav") {
      const e = emailE1(meno, o, base);
      const m = await fetch(`${GHL}/conversations/messages`, { method: "POST", headers: hlavicky(env, "2021-04-15"),
        body: JSON.stringify({ type: "Email", contactId: id, subject: e.predmet, html: e.html }) });
      const md = await m.json().catch(() => ({}));
      if (!m.ok || !(md.messageId || md.emailMessageId)) {
        console.error("zmena e-mail", m.status, JSON.stringify(md).slice(0, 300));
        return json({ ok: false, error: "ghl_email" }, 502);
      }
    }
    return json({ ok: true, teplota });
  } catch (e) {
    console.error("zmena", String(e));
    return json({ ok: false, error: "ghl_error" }, 502);
  }
}

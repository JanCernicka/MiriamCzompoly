/**
 * POST /api/navod: návod „Ako začať s interiérom, keď nevieš ako“ (PDF od Miriam, 2. 10. 2026)
 * z vyskakovacieho okna na /diagnostika (assets/js/navod.js).
 *
 *  1. upsert kontaktu BEZ značiek (upsert by existujúce značky prepísal)
 *  2. e-mail prečítať späť (200 OK nie je dôkaz)
 *  3. značka „navod-ako-zacat“ samostatným volaním
 *  4. e-mail s návodom hneď, cez GHL Conversations (nie cez workflow: tie e-booku nikdy
 *     nebežali, viď functions/api/ebook.js na vetve claude/ebook-konzultacia)
 * PDF je na našom webe (/navod/ako-zacat-s-interierom.pdf), jeho posledná strana vedie na /diagnostika.
 * TEST_REZIM=1: nič sa nezapíše, len sa overia údaje a vráti sa úspech.
 */
import { GHL, json, hlavicky, nastavene } from "../_lib/ghl.js";

const ZNACKA = "navod-ako-zacat";
const ZDROJ = "Návod Ako začať s interiérom (okno na /diagnostika)";
const PDF = "https://www.miriamczompoly.sk/navod/ako-zacat-s-interierom.pdf";
const PREDMET = "Tvoj návod: Ako začať s interiérom";
const TELO = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#262019;max-width:560px">
<p>Ahoj,</p>
<p>tu je návod, ktorý si si pýtala: <b>Ako začať s interiérom, keď nevieš ako</b>.</p>
<p><a href="${PDF}" style="display:inline-block;background:#262019;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:bold">Stiahnuť návod (PDF)</a></p>
<p>Je to pracovný zošit. Vytlač si ho alebo si odpovede píš bokom a pri každej otázke si daj chvíľu čas. Najviac ti povie pôdorys, ktorý si vyfarbíš podľa pocitu.</p>
<p>Ak by ti niečo nebolo jasné, stačí odpísať na tento e-mail, čítam každú správu.</p>
<p>Miriam</p></div>`;
const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  if (cisty(b.website, 200)) return json({ ok: true });            // pasca na roboty
  const email = cisty(b.email, 254).toLowerCase();
  if (!isEmail(email)) return json({ ok: false, error: "bad_email" }, 400);

  if (env.TEST_REZIM === "1") return json({ ok: true, test: true });
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);

  const H = hlavicky(env);
  try {
    const up = await fetch(`${GHL}/contacts/upsert`, { method: "POST", headers: H,
      body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, email, source: ZDROJ }) });
    const upd = await up.json().catch(() => ({}));
    const id = upd.contact && upd.contact.id;
    if (!up.ok || !id) { console.error("navod upsert", up.status, JSON.stringify(upd).slice(0, 300)); return json({ ok: false, error: "ghl_contact" }, 502); }

    const c = ((await (await fetch(`${GHL}/contacts/${id}`, { headers: H })).json().catch(() => ({}))).contact) || {};
    if ((c.email || "").toLowerCase() !== email) { console.error("navod: kontakt sa neuložil"); return json({ ok: false, error: "ghl_readback" }, 502); }

    const tg = await fetch(`${GHL}/contacts/${id}/tags`, { method: "POST", headers: H, body: JSON.stringify({ tags: [ZNACKA] }) });
    if (!tg.ok) console.error("navod značka", tg.status);

    const m = await fetch(`${GHL}/conversations/messages`, { method: "POST", headers: hlavicky(env, "2021-04-15"),
      body: JSON.stringify({ type: "Email", contactId: id, subject: PREDMET, html: TELO }) });
    const md = await m.json().catch(() => ({}));
    const emailId = md.messageId || md.emailMessageId || null;
    if (!m.ok || !emailId) { console.error("navod e-mail", m.status, JSON.stringify(md).slice(0, 300)); return json({ ok: false, error: "ghl_email" }, 502); }
    return json({ ok: true });
  } catch (e) {
    console.error("navod", String(e));
    return json({ ok: false, error: "ghl_error" }, 502);
  }
}

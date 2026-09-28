/**
 * POST /api/ebook: prihlásenie na e-book „5 najdrahších chýb“ z vlastného formulára
 * na /5-chyb (predtým GHL formulár geA4rea6TYWIKcskupXQ v iframe).
 *
 * Prečo vlastný formulár: po e-booku ide žena na /konzultacia-zdarma a tam si má
 * rezervovať bez toho, aby písala údaje druhýkrát. Z GHL iframe sa údaje nedajú prečítať.
 *
 *  1. upsert kontaktu BEZ značiek (upsert by existujúce značky prepísal)
 *  2. meno a e-mail prečítať späť (200 OK nie je dôkaz)
 *  3. značka „ebook-5-chyb“ samostatným volaním
 *  4. e-mail s e-bookom hneď, cez GHL Conversations (text E1 zo sekvencie A, step6d)
 * 🔴 Prečo e-mail posiela táto funkcia a nie WF1: WF1 („Lead magnet nurture“) nebol nikdy
 *    zapnutý, e-book nedostal nikto (overené 28. 9. 2026 na kontakte z 25. 9.). Keď sa WF1
 *    zapne, NESMIE posielať E1 znova: spúšťať ho značkou „ebook-5-chyb“ a začať od E2.
 * TEST_REZIM=1: nič sa nezapíše, len sa overia údaje a vráti sa úspech.
 */
import { GHL, json, hlavicky, nastavene } from "../_lib/ghl.js";

const ZNACKA = "ebook-5-chyb";
const ZDROJ = "Formulár – 5 chýb (lead magnet)";   // ten istý zdroj ako mal GHL formulár
const PDF = "https://assets.cdn.filesafe.space/o86atLjsdR9IoUTWgYna/media/d68c8922-e5af-4443-9e14-e89354c82dad.pdf";
const PREDMET = "Tu je tvojich 5 najdrahších chýb";
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const E1 = (meno) => `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#262019;max-width:560px">
<p>Ahoj ${esc(meno)},</p>
<p>tu je, čo si si pýtala: <b>5 najdrahších chýb, ktoré ľudia robia pri zariaďovaní domova</b>.</p>
<p><a href="${PDF}" style="display:inline-block;background:#262019;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:bold">Stiahnuť e-book (PDF)</a></p>
<p>Prejdi si to v pokoji. Väčšina žien sa v bode 2 spozná okamžite.</p>
<p>Ak by ti niečo nebolo jasné, stačí odpísať na tento e-mail, čítam každú správu.</p>
<p>Miriam</p></div>`;
const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const meno = cisty(b.meno, 60), email = cisty(b.email, 254).toLowerCase();
  if (meno.length < 2 || !isEmail(email)) return json({ ok: false, error: "bad_contact" }, 400);
  if (!b.suhlas) return json({ ok: false, error: "no_consent" }, 400);

  if (env.TEST_REZIM === "1") return json({ ok: true, test: true });
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);

  const H = hlavicky(env);
  try {
    const up = await fetch(`${GHL}/contacts/upsert`, { method: "POST", headers: H,
      body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, email, firstName: meno, source: ZDROJ }) });
    const upd = await up.json().catch(() => ({}));
    const id = upd.contact && upd.contact.id;
    if (!up.ok || !id) { console.error("upsert", up.status, JSON.stringify(upd).slice(0, 300)); return json({ ok: false, error: "ghl_contact" }, 502); }

    const c = ((await (await fetch(`${GHL}/contacts/${id}`, { headers: H })).json().catch(() => ({}))).contact) || {};
    if ((c.email || "").toLowerCase() !== email) { console.error("kontakt sa neuložil"); return json({ ok: false, error: "ghl_readback" }, 502); }

    const tg = await fetch(`${GHL}/contacts/${id}/tags`, { method: "POST", headers: H, body: JSON.stringify({ tags: [ZNACKA] }) });
    if (!tg.ok) console.error("značka", tg.status);

    // e-mail s e-bookom; zlyhanie nezastaví ženu, PDF má aj na ďalšej stránke
    let emailId = null;
    try {
      const m = await fetch(`${GHL}/conversations/messages`, { method: "POST", headers: hlavicky(env, "2021-04-15"),
        body: JSON.stringify({ type: "Email", contactId: id, subject: PREDMET, html: E1(c.firstName || meno) }) });
      const md = await m.json().catch(() => ({}));
      emailId = md.messageId || md.emailMessageId || null;
      if (!m.ok || !emailId) console.error("e-mail e-book", m.status, JSON.stringify(md).slice(0, 300));
    } catch (e) { console.error("e-mail e-book", String(e)); }
    return json({ ok: true, contactId: id, emailOdoslany: !!emailId });
  } catch (e) {
    console.error("ebook", String(e));
    return json({ ok: false, error: "ghl_error" }, 502);
  }
}

/**
 * POST /api/zmena-hovor: rezervácia 10-minútového úvodného hovoru z /pred-zmenou-hovor (16. 11. 2026).
 * Rovnaký postup a ten istý kalendár ako /api/rozhovor pri pláne (Miriam má jeden kalendár krátkych hovorov):
 *  1. čas je stále voľný, inak 409 a stránka ponúkne iný
 *  2. upsert kontaktu BEZ značiek, telefón prečítať späť (pri duplicitnom čísle rezervácia aj tak pokračuje)
 *  3. značka pz-hovor (zastaví sekvencie e-mailov), termín, karta „Krátky hovor rezervovaný“, poznámka
 *  4. potvrdenie zákazníčke (SMS + e-mail) a SMS Miriam
 * Úvodný hovor nie je poradenstvo (Miriam 13. 11.): na hovore len zistí, či a ako vie pomôcť.
 * TEST_REZIM=1: nič sa nezapíše. TEST_REZIM=ghl-bez-sprav: zapíše sa všetko, ale nič neodíde.
 */
import { GHL, json, hlavicky, nastavene, volneSloty,
         KALENDAR_PLAN_ID, MIRIAM_USER_ID, FAZA_HOVOR, FAZA_LEAD, FAZA_LEAD_MAGNET, MIRIAM_KONTAKT_ID, prilezitost } from "../_lib/ghl.js";
import { kedyText, gsm, smsOk } from "../_lib/profil.js";
import { PZ, ZNACKA, odkazPoradie, WEB } from "../_lib/pz.js";

const DLZKA_MIN = 10;
const ZDROJ = "Pred veľkou zmenou (/pred-zmenou), úvodný hovor";
const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function telefon(v) {
  let s = String(v || "").replace(/[^\d+]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (s.startsWith("0")) s = "+421" + s.slice(1);
  if (!s.startsWith("+")) s = "+421" + s;
  return s.replace(/\D/g, "").length >= 11 ? s : null;
}
async function posli(env, telo) {
  const r = await fetch(`${GHL}/conversations/messages`, { method: "POST", headers: hlavicky(env, "2021-04-15"), body: JSON.stringify(telo) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !(d.messageId || d.emailMessageId)) { console.error("zmena-hovor správa", telo.type, r.status, JSON.stringify(d).slice(0, 300)); return false; }
  return true;
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const start = cisty(b.start, 40), startMs = Date.parse(start);
  const meno = cisty(b.meno, 60), email = cisty(b.email, 254).toLowerCase(), tel = telefon(b.telefon);
  if (isNaN(startMs) || startMs < Date.now()) return json({ ok: false, error: "bad_start" }, 400);
  if (!isEmail(email) || !tel) return json({ ok: false, error: "bad_contact" }, 400);
  const o = b.odpovede && PZ.platne(b.odpovede) ? b.odpovede : null;   // z e-mailu prichádza bez odpovedí

  if (env.TEST_REZIM === "1") {
    console.log("TEST_REZIM: úvodný hovor neodoslaný", new Date(startMs).toISOString());
    return json({ ok: true, test: true });
  }
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);
  const ticho = env.TEST_REZIM === "ghl-bez-sprav";
  const base = new URL(request.url).origin;
  const H = hlavicky(env);
  try {
    const den = start.slice(0, 10);
    const sloty = await volneSloty(env, startMs - 12 * 3600000, startMs + 12 * 3600000, KALENDAR_PLAN_ID);
    if (!(sloty[den] || []).some((s) => Date.parse(s) === startMs)) return json({ ok: false, error: "slot_taken" }, 409);

    const telo = { locationId: env.GHL_LOCATION_ID, email, phone: tel, source: ZDROJ };
    if (meno.length >= 2) telo.firstName = meno;
    const up = await fetch(`${GHL}/contacts/upsert`, { method: "POST", headers: H, body: JSON.stringify(telo) });
    const upd = await up.json().catch(() => ({}));
    const id = upd.contact && upd.contact.id;
    if (!up.ok || !id) { console.error("zmena-hovor upsert", up.status, JSON.stringify(upd).slice(0, 300)); return json({ ok: false, error: "ghl_contact" }, 502); }

    // 🔴 200 OK nie je dôkaz: Miriam volá na číslo z kontaktu (rovnaké pasce ako /api/rozhovor)
    const c = ((await (await fetch(`${GHL}/contacts/${id}`, { headers: H })).json().catch(() => ({}))).contact) || {};
    const krstne = meno.length >= 2 ? meno : (c.firstName || "");
    let smsKontakt = id, inyKontakt = null;
    if (c.phone !== tel) {
      const dr = await fetch(`${GHL}/contacts/search/duplicate?locationId=${env.GHL_LOCATION_ID}&number=${encodeURIComponent(tel)}`, { headers: H });
      const dup = ((await dr.json().catch(() => ({}))).contact) || null;
      if (!dup || !dup.id || dup.id === id) { console.error("zmena-hovor: telefón sa neuložil", tel, c.phone); return json({ ok: false, error: "bad_phone" }, 400); }
      inyKontakt = smsKontakt = dup.id;
    }

    const tg = await fetch(`${GHL}/contacts/${id}/tags`, { method: "POST", headers: H, body: JSON.stringify({ tags: [ZNACKA.vsetci, ZNACKA.hovor] }) });
    if (!tg.ok) console.error("zmena-hovor značka", tg.status);

    const ap = await fetch(`${GHL}/calendars/events/appointments`, { method: "POST", headers: hlavicky(env, "2021-04-15"),
      body: JSON.stringify({ calendarId: KALENDAR_PLAN_ID, locationId: env.GHL_LOCATION_ID, contactId: id,
        assignedUserId: MIRIAM_USER_ID, startTime: new Date(startMs).toISOString(),
        endTime: new Date(startMs + DLZKA_MIN * 60000).toISOString(), title: `Úvodný hovor (Pred zmenou): ${krstne || email}`,
        appointmentStatus: "confirmed", address: `Telefonát, Miriam volá na ${tel}`, toNotify: !ticho }) });
    const apd = await ap.json().catch(() => ({}));
    if (!ap.ok) {
      const t = JSON.stringify(apd).toLowerCase();
      console.error("zmena-hovor termín", ap.status, t.slice(0, 300));
      if (t.includes("slot") || t.includes("available")) return json({ ok: false, error: "slot_taken" }, 409);
      return json({ ok: false, error: "ghl_appointment" }, 502);
    }

    await prilezitost(env, id, { faza: FAZA_HOVOR, posunZ: [FAZA_LEAD, FAZA_LEAD_MAGNET], nazov: `${krstne || email} · ${tel}`, zdroj: "Pred veľkou zmenou" });

    const odkaz = o ? odkazPoradie(base, o, krstne) : "";
    const nt = await fetch(`${GHL}/contacts/${id}/notes`, { method: "POST", headers: H,
      body: JSON.stringify({ body: `Úvodný hovor (Pred veľkou zmenou) ${kedyText(startMs)}, Miriam volá na ${tel}.` +
        (odkaz ? `\nPoradie krokov: ${odkaz}` : "") + (inyKontakt ? `\nToto číslo má v GHL aj iný kontakt (${inyKontakt}).` : "") }) });
    if (!nt.ok) console.error("zmena-hovor poznámka", nt.status);

    if (!ticho) {
      const kedy = kedyText(startMs);
      const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#262019;max-width:560px">` +
        `<p>Ahoj${krstne ? " " + esc(krstne) : ""},</p><p>ďakujem, úvodný hovor máme <b>${esc(kedy)}</b>. Zavolám ti na číslo ${esc(tel)}, potrvá 10 minút.</p>` +
        `<p>Tvoje odpovede už mám pred sebou. Doplníš mi, čo sa do otázok nezmestilo, a ja ti poviem, či a ako ti viem pomôcť.</p>` +
        `<p>Ak ti čas nebude vyhovovať, odpíš mi a dohodneme iný.</p><p>Miriam</p></div>`;
      const sms = gsm(`Miriam Czompoly: uvodny hovor mame ${kedyText(startMs, true)}. Zavolam ti na toto cislo. Ak ti cas nevyhovuje, odpis sem.`);
      const m = gsm(krstne || email).slice(0, 24), plan = odkaz.replace(/^https?:\/\/(www\.)?/, "");
      let smsM = gsm(`UVODNY HOVOR ${kedyText(startMs, true).replace(/^vo? /, "")}: ${m}, ${tel}.` + (plan ? ` Poradie: ${plan}` : ""));
      if (smsM.length > 160) smsM = gsm(`UVODNY HOVOR ${kedyText(startMs, true).replace(/^vo? /, "")}: ${m}, ${tel}. Odpovede su v poznamke kontaktu.`).slice(0, 160);
      if (!smsOk(sms) || !smsOk(smsM)) console.error("zmena-hovor: SMS nie je čisté GSM-7 do 160 znakov");
      await Promise.all([
        posli(env, { type: "Email", contactId: id, subject: `Úvodný hovor ${kedy}`, html }),
        posli(env, { type: "SMS", contactId: smsKontakt, message: sms }),
        posli(env, { type: "SMS", contactId: MIRIAM_KONTAKT_ID, message: smsM }),
      ]);
    }
    return json({ ok: true });
  } catch (e) {
    console.error("zmena-hovor: GHL nedostupné", String(e));
    return json({ ok: false, error: "ghl_unreachable" }, 502);
  }
}

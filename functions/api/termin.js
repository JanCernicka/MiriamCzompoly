/**
 * POST /api/termin: rezervácia diagnostiky z variantu B.
 * Robí to isté, čo GHL kalendár na variante A (termín v tom istom kalendári,
 * WF3 potom pošle rovnaké potvrdenie a pripomienky), a navyše:
 *   značka diagnostika-lp-b, aby bolo v GHL vidieť, z ktorej stránky prišla,
 *   príležitosť vo fáze „Diagnostika rezervovaná“, ak otvorenú ešte nemá.
 *
 * Poradie (GHLtool lievik/04_NAPOJENIE.md):
 *  1. termín je stále voľný, inak 409 a stránka ponúkne iný
 *  2. upsert kontaktu BEZ značiek (upsert by existujúce značky prepísal)
 *  3. adresu prečítať späť PRED termínom: SMS pre Miriam a SMS 2 h pred ju berú z kontaktu
 *  4. značka samostatným volaním
 *  5. termín s assignedUserId (bez neho 422), bez ignoreFreeSlotValidation
 *  6. príležitosť, ak otvorená nie je; názov meno + telefón
 * TEST_REZIM=1: nič sa nezapíše, len sa overia údaje a vráti sa úspech.
 * TEST_REZIM=ghl-bez-sprav: zapíše sa všetko ako naostro, ale termín bez notifikácií
 *   kalendára (toNotify false). Len na náhľade, na overenie celého zápisu bez toho,
 *   aby Miriam dostala testovacie upozornenie. WF3 treba potom z kontaktu vyhodiť do 2 minút.
 */
import { GHL, json, hlavicky, nastavene, volneSloty,
         KALENDAR_ID, MIRIAM_USER_ID, PIPELINE_ID, FAZA_REZERVOVANA } from "../_lib/ghl.js";

const ZNACKA = "diagnostika-lp-b";
const CENA = 249;
const DLZKA_MIN = 30;   // dĺžka slotu v kalendári, nie dĺžka diagnostiky
const NAZOV_TERMINU = "Interiérová diagnostika";   // ten istý ako pri rezervácii cez GHL na A

const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;
function telefon(v) {
  let s = String(v || "").replace(/[^\d+]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (s.startsWith("0")) s = "+421" + s.slice(1);
  if (!s.startsWith("+")) s = "+421" + s;
  return s.replace(/\D/g, "").length >= 11 ? s : null;
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }

  const start = cisty(b.start, 40), startMs = Date.parse(start);
  const meno = cisty(b.meno, 60), email = cisty(b.email, 254).toLowerCase(), tel = telefon(b.telefon);
  const ulica = cisty(b.ulica, 120), mesto = cisty(b.mesto, 60);
  if (isNaN(startMs) || startMs < Date.now()) return json({ ok: false, error: "bad_start" }, 400);
  if (meno.length < 2 || !isEmail(email) || !tel) return json({ ok: false, error: "bad_contact" }, 400);
  if (ulica.length < 3 || mesto.length < 2) return json({ ok: false, error: "bad_address" }, 400);

  if (env.TEST_REZIM === "1") {
    console.log("TEST_REZIM: rezervácia neodoslaná", start);
    return json({ ok: true, test: true });
  }
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);

  const H = hlavicky(env);
  try {
    const den = start.slice(0, 10);
    const sloty = await volneSloty(env, startMs - 12 * 3600000, startMs + 12 * 3600000);
    if (!(sloty[den] || []).some((s) => Date.parse(s) === startMs)) return json({ ok: false, error: "slot_taken" }, 409);

    const up = await fetch(`${GHL}/contacts/upsert`, { method: "POST", headers: H,
      body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, email, firstName: meno, phone: tel,
                             address1: ulica, city: mesto, source: "Diagnostika, stránka B" }) });
    const upd = await up.json().catch(() => ({}));
    const id = upd.contact && upd.contact.id;
    if (!up.ok || !id) { console.error("upsert", up.status, JSON.stringify(upd).slice(0, 300)); return json({ ok: false, error: "ghl_contact" }, 502); }

    // 🔴 200 OK nie je dôkaz, čítať späť
    const c = ((await (await fetch(`${GHL}/contacts/${id}`, { headers: H })).json().catch(() => ({}))).contact) || {};
    if (c.address1 !== ulica || c.city !== mesto) { console.error("adresa sa neuložila"); return json({ ok: false, error: "ghl_address" }, 502); }

    const tg = await fetch(`${GHL}/contacts/${id}/tags`, { method: "POST", headers: H, body: JSON.stringify({ tags: [ZNACKA] }) });
    if (!tg.ok) console.error("značka", tg.status);

    const ap = await fetch(`${GHL}/calendars/events/appointments`, { method: "POST", headers: hlavicky(env, "2021-04-15"),
      body: JSON.stringify({ calendarId: KALENDAR_ID, locationId: env.GHL_LOCATION_ID, contactId: id,
        assignedUserId: MIRIAM_USER_ID, startTime: new Date(startMs).toISOString(),
        endTime: new Date(startMs + DLZKA_MIN * 60000).toISOString(), title: NAZOV_TERMINU,
        appointmentStatus: "confirmed", address: `${ulica}, ${mesto}`,
        toNotify: env.TEST_REZIM !== "ghl-bez-sprav" }) });
    const apd = await ap.json().catch(() => ({}));
    if (!ap.ok) {
      const t = JSON.stringify(apd).toLowerCase();
      console.error("termín", ap.status, t.slice(0, 300));
      if (t.includes("slot") || t.includes("available")) return json({ ok: false, error: "slot_taken" }, 409);
      return json({ ok: false, error: "ghl_appointment" }, 502);
    }

    try {
      const s = await fetch(`${GHL}/opportunities/search?location_id=${env.GHL_LOCATION_ID}&contact_id=${id}&status=open&limit=5`, { headers: H });
      const sd = await s.json().catch(() => ({}));
      if (s.ok && !(sd.opportunities || []).length) {
        const o = await fetch(`${GHL}/opportunities/`, { method: "POST", headers: H,
          body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, pipelineId: PIPELINE_ID, pipelineStageId: FAZA_REZERVOVANA,
            contactId: id, name: `${meno} · ${tel}`, status: "open", monetaryValue: CENA }) });
        if (!o.ok) console.error("príležitosť", o.status);
      }
    } catch (e) { console.error("príležitosť", String(e)); }

    return json({ ok: true, contactId: id, appointmentId: apd.id || (apd.appointment && apd.appointment.id) || null });
  } catch (e) {
    console.error("GHL nedostupné", String(e));
    return json({ ok: false, error: "ghl_unreachable" }, 502);
  }
}

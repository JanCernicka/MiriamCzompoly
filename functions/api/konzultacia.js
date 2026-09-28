/**
 * /api/konzultacia: uvítací hovor (15 min, po telefóne) ponúknutý hneď po e-booku (/konzultacia-zdarma).
 * Kalendár „Bezplatná konzultácia s Miriam Czompoly“ (15 min, Google Meet).
 *
 * GET:  voľné termíny, 5 dní s voľnom, časy na celú a pol hodinu, najviac 10 na deň
 * POST: meno a e-mail sú z e-booku, stránka pýta len telefón
 *  1. termín je stále voľný, inak 409 a stránka ponúkne iný
 *  2. upsert kontaktu podľa e-mailu BEZ značiek, meno späť
 *  3. značka „konzultacia-zdarma-ebook“
 *  4. termín s assignedUserId (bez neho 422), bez ignoreFreeSlotValidation
 * 🔴 Na termín v tomto kalendári reagujú staré zapnuté workflowy („WebStránka -
 *    Telefonická konzultácia potvrdenie termínu“, „Pripomienka termínu 2 hodiny a 10 minút
 *    pred“). Ich texty treba skontrolovať pred spustením naostro.
 * TEST_REZIM=1: nič sa nezapíše, len sa overia údaje a vráti sa úspech.
 */
import { GHL, json, hlavicky, nastavene, volneSloty, KONZULTACIA_ID, MIRIAM_USER_ID } from "../_lib/ghl.js";

const ZNACKA = "konzultacia-zdarma-ebook";
const DLZKA_MIN = 15;
const NAZOV = "Uvítací hovor (po e-booku)";
const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
function telefon(v) {
  let s = String(v || "").replace(/[^\d+]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (s.startsWith("0")) s = "+421" + s.slice(1);
  if (!s.startsWith("+")) s = "+421" + s;
  return s.replace(/\D/g, "").length >= 11 ? s : null;
}
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;

export async function onRequestGet({ env }) {
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);
  try {
    const teraz = Date.now();
    const sloty = await volneSloty(env, teraz, teraz + 14 * 86400000, KONZULTACIA_ID);
    const days = Object.keys(sloty).sort()
      .map((date) => ({ date, slots: sloty[date].filter((s) => /:(00|30):/.test(s.slice(13, 17))).slice(0, 10) }))
      .filter((d) => d.slots.length).slice(0, 5);
    return json({ ok: true, days });
  } catch (e) {
    console.error("konzultacia sloty", String(e));
    return json({ ok: false, error: "ghl_error" }, 502);
  }
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const start = cisty(b.start, 40), startMs = Date.parse(start);
  const meno = cisty(b.meno, 60), email = cisty(b.email, 254).toLowerCase();
  if (isNaN(startMs) || startMs < Date.now()) return json({ ok: false, error: "bad_start" }, 400);
  const tel = telefon(b.telefon);
  if (meno.length < 2 || !isEmail(email) || !tel) return json({ ok: false, error: "bad_contact" }, 400);

  if (env.TEST_REZIM === "1") return json({ ok: true, test: true });
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);

  const H = hlavicky(env);
  try {
    const den = start.slice(0, 10);
    const sloty = await volneSloty(env, startMs - 12 * 3600000, startMs + 12 * 3600000, KONZULTACIA_ID);
    if (!(sloty[den] || []).some((s) => Date.parse(s) === startMs)) return json({ ok: false, error: "slot_taken" }, 409);

    const up = await fetch(`${GHL}/contacts/upsert`, { method: "POST", headers: H,
      body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, email, firstName: meno, phone: tel }) });
    const upd = await up.json().catch(() => ({}));
    const id = upd.contact && upd.contact.id;
    if (!up.ok || !id) { console.error("upsert", up.status, JSON.stringify(upd).slice(0, 300)); return json({ ok: false, error: "ghl_contact" }, 502); }

    const tg = await fetch(`${GHL}/contacts/${id}/tags`, { method: "POST", headers: H, body: JSON.stringify({ tags: [ZNACKA] }) });
    if (!tg.ok) console.error("značka", tg.status);

    const ap = await fetch(`${GHL}/calendars/events/appointments`, { method: "POST", headers: hlavicky(env, "2021-04-15"),
      body: JSON.stringify({ calendarId: KONZULTACIA_ID, locationId: env.GHL_LOCATION_ID, contactId: id,
        assignedUserId: MIRIAM_USER_ID, startTime: new Date(startMs).toISOString(),
        endTime: new Date(startMs + DLZKA_MIN * 60000).toISOString(), title: NAZOV,
        appointmentStatus: "confirmed", toNotify: env.TEST_REZIM !== "ghl-bez-sprav" }) });
    const apd = await ap.json().catch(() => ({}));
    const apId = apd.id || (apd.appointment && apd.appointment.id);
    if (!ap.ok || !apId) { console.error("termín", ap.status, JSON.stringify(apd).slice(0, 300)); return json({ ok: false, error: "ghl_appointment" }, 502); }
    return json({ ok: true, contactId: id, appointmentId: apId });
  } catch (e) {
    console.error("konzultacia", String(e));
    return json({ ok: false, error: "ghl_error" }, 502);
  }
}

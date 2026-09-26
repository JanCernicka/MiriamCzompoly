/**
 * POST /api/sutaz-termin: rezervácia diagnostiky za polovicu pre účastníčky súťaže.
 *
 * Poradie je dôležité:
 *  1. termín je stále voľný (inak 409, stránka ponúkne iný)
 *  2. kontakt: upsert BEZ tagov (upsert by existujúce tagy prepísal)
 *  3. adresu prečítať späť PRED termínom: SMS pre Miriam a SMS 2 h pred berú
 *     {{contact.address1}}, bez nej by odišli bez adresy
 *  4. tag samostatným volaním
 *  5. termín, s assignedUserId (bez neho 422), BEZ ignoreFreeSlotValidation
 *  6. príležitosť vo fáze „Diagnostika rezervovaná“, ak kontakt otvorenú ešte nemá
 *  7. vyhodiť z workflowu s pripomienkami 72 h / 24 h (PONUKA_WF_ID)
 */
import {
  GHL, json, hlavicky, nastavene, volneSloty,
  KALENDAR_ID, MIRIAM_USER_ID, PIPELINE_ID, FAZA_REZERVOVANA,
} from "../_lib/ghl.js";

const TAG = "sutaz-1000-diagnostika-50";
const CENA = 124.5;
const DLZKA_MIN = 30; // dĺžka slotu v kalendári, nie dĺžka diagnostiky

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
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);

  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }

  const start = cisty(b.start, 40);
  const meno = cisty(b.meno, 60);
  const email = cisty(b.email, 254).toLowerCase();
  const tel = telefon(b.telefon);
  const ulica = cisty(b.ulica, 120);
  const mesto = cisty(b.mesto, 60);
  const startMs = Date.parse(start);
  if (isNaN(startMs) || startMs < Date.now()) return json({ ok: false, error: "bad_start" }, 400);
  if (meno.length < 2 || !isEmail(email) || !tel) return json({ ok: false, error: "bad_contact" }, 400);
  if (ulica.length < 3 || mesto.length < 2) return json({ ok: false, error: "bad_address" }, 400);

  const H = hlavicky(env);
  try {
    // 1. je čas stále voľný?
    const den = start.slice(0, 10);
    const sloty = await volneSloty(env, startMs - 12 * 3600000, startMs + 12 * 3600000);
    const volne = (sloty[den] || []).some((s) => Date.parse(s) === startMs);
    if (!volne) return json({ ok: false, error: "slot_taken" }, 409);

    // 2. kontakt bez tagov
    const up = await fetch(`${GHL}/contacts/upsert`, {
      method: "POST", headers: H,
      body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, email, firstName: meno, phone: tel, address1: ulica, city: mesto, source: "Súťaž 1 000 € (lievik)" }),
    });
    const upd = await up.json().catch(() => ({}));
    const contactId = upd.contact && upd.contact.id;
    if (!up.ok || !contactId) {
      console.error("upsert zlyhal", up.status, JSON.stringify(upd).slice(0, 300));
      return json({ ok: false, error: "ghl_contact" }, 502);
    }

    // 3. prečítať späť: GHL vie vrátiť 200 a neuložiť nič
    const rd = await fetch(`${GHL}/contacts/${contactId}`, { headers: H });
    const c = ((await rd.json().catch(() => ({}))).contact) || {};
    if (c.address1 !== ulica || c.city !== mesto) {
      console.error("adresa sa neuložila", JSON.stringify({ a: c.address1, m: c.city }));
      return json({ ok: false, error: "ghl_address" }, 502);
    }

    // 4. tag zvlášť
    const tg = await fetch(`${GHL}/contacts/${contactId}/tags`, { method: "POST", headers: H, body: JSON.stringify({ tags: [TAG] }) });
    if (!tg.ok) console.error("tag zlyhal", tg.status);

    // 5. termín
    const ap = await fetch(`${GHL}/calendars/events/appointments`, {
      method: "POST", headers: hlavicky(env, "2021-04-15"),
      body: JSON.stringify({
        calendarId: KALENDAR_ID,
        locationId: env.GHL_LOCATION_ID,
        contactId,
        assignedUserId: MIRIAM_USER_ID,
        startTime: new Date(startMs).toISOString(),
        endTime: new Date(startMs + DLZKA_MIN * 60000).toISOString(),
        title: `Diagnostika -50 % (súťaž): ${meno}`,
        appointmentStatus: "confirmed",
        address: `${ulica}, ${mesto}`,
        toNotify: true,
      }),
    });
    const apd = await ap.json().catch(() => ({}));
    if (!ap.ok) {
      const msg = JSON.stringify(apd).toLowerCase();
      console.error("termín zlyhal", ap.status, msg.slice(0, 300));
      if (msg.includes("slot") || msg.includes("available")) return json({ ok: false, error: "slot_taken" }, 409);
      return json({ ok: false, error: "ghl_appointment" }, 502);
    }

    // 6. príležitosť, ak otvorená ešte nie je
    try {
      const s = await fetch(`${GHL}/opportunities/search?location_id=${env.GHL_LOCATION_ID}&contact_id=${contactId}&pipeline_id=${PIPELINE_ID}&status=open`, { headers: H });
      const sd = await s.json().catch(() => ({}));
      if (s.ok && !(sd.opportunities || []).length) {
        const o = await fetch(`${GHL}/opportunities/`, {
          method: "POST", headers: H,
          body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, pipelineId: PIPELINE_ID, pipelineStageId: FAZA_REZERVOVANA,
            contactId, name: `Diagnostika -50 % (súťaž): ${meno}`, status: "open", monetaryValue: CENA }),
        });
        if (!o.ok) console.error("príležitosť zlyhala", o.status);
      }
    } catch (e) { console.error("príležitosť", String(e)); }

    // 7. má termín, pripomienku „zostáva 24 hodín“ už nedostane
    //    (workflow ghl/build_ponuka_workflow.py, jeho ID je v premennej PONUKA_WF_ID)
    if (env.PONUKA_WF_ID) {
      const w = await fetch(`${GHL}/contacts/${contactId}/workflow/${env.PONUKA_WF_ID}`, { method: "DELETE", headers: H });
      if (!w.ok) console.error("vyhodenie z pripomienok zlyhalo", w.status);
    } else {
      console.error("PONUKA_WF_ID chýba, kontakt ostáva v pripomienkach");
    }

    return json({ ok: true, appointmentId: apd.id || (apd.appointment && apd.appointment.id) || null });
  } catch (e) {
    console.error("GHL nedostupné", String(e));
    return json({ ok: false, error: "ghl_unreachable" }, 502);
  }
}

export const onRequestGet = () => json({ ok: false, error: "method_not_allowed" }, 405);

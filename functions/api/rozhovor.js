/**
 * POST /api/rozhovor: rezervácia 10-minútového hovoru k plánu z /profil-rezervacia (12. 10. 2026).
 * Horúci z testu: Miriam im plán odovzdá osobne, volá ona.
 *
 * Poradie (ako /api/termin):
 *  1. čas je stále voľný v kalendári „Hovor k plánu (10 min)“, inak 409 a stránka ponúkne iný
 *  2. upsert kontaktu BEZ značiek, s poľami plan_*; telefón prečítať späť
 *  3. značky plan-test a plan-hovor samostatným volaním
 *  4. termín s assignedUserId (bez neho 422), bez ignoreFreeSlotValidation
 *  5. príležitosť vo fáze „Krátky hovor rezervovaný“, ak otvorenú ešte nemá
 *  6. poznámka s odpoveďami a odkazom na plán
 *  7. potvrdenie zákazníčke (SMS + e-mail) a SMS Miriam s odkazom na plán, cez GHL Conversations.
 *     Kalendár nemá vlastné GHL notifikácie ani Google pozvánku, takže potvrdenie je len toto.
 *     Keď správa zlyhá, rezervácia ostáva (termín už existuje), chyba ide do logu.
 * TEST_REZIM=1: nič sa nezapíše, len sa overia údaje a vráti sa úspech.
 * TEST_REZIM=ghl-bez-sprav: zapíše sa všetko ako naostro, ale nič neodíde (ani SMS Miriam).
 */
import { GHL, json, hlavicky, nastavene, volneSloty,
         KALENDAR_PLAN_ID, MIRIAM_USER_ID, PIPELINE_ID, FAZA_HOVOR, MIRIAM_KONTAKT_ID } from "../_lib/ghl.js";
import { platneOdpovede, polia, ZNACKA, poznamka, kedyText,
         emailPotvrdenie, smsPotvrdenie, smsMiriam, smsOk } from "../_lib/profil.js";

const DLZKA_MIN = 10;
const ZDROJ = "Plán od Miriam (/profil), hovor";
const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;
function telefon(v) {
  let s = String(v || "").replace(/[^\d+]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (s.startsWith("0")) s = "+421" + s.slice(1);
  if (!s.startsWith("+")) s = "+421" + s;
  return s.replace(/\D/g, "").length >= 11 ? s : null;
}

async function posli(env, telo) {
  const r = await fetch(`${GHL}/conversations/messages`, { method: "POST", headers: hlavicky(env, "2021-04-15"),
    body: JSON.stringify(telo) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !(d.messageId || d.emailMessageId)) {
    console.error("rozhovor správa", telo.type, r.status, JSON.stringify(d).slice(0, 300));
    return false;
  }
  return true;
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }

  const start = cisty(b.start, 40), startMs = Date.parse(start);
  const meno = cisty(b.meno, 60), email = cisty(b.email, 254).toLowerCase(), tel = telefon(b.telefon);
  if (isNaN(startMs) || startMs < Date.now()) return json({ ok: false, error: "bad_start" }, 400);
  if (meno.length < 2 || !isEmail(email) || !tel) return json({ ok: false, error: "bad_contact" }, 400);
  if (!platneOdpovede(b.odpovede)) return json({ ok: false, error: "bad_answers" }, 400);
  const o = b.odpovede;

  if (env.TEST_REZIM === "1") {
    console.log("TEST_REZIM: hovor neodoslaný", new Date(startMs).toISOString(), JSON.stringify(o));
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

    const up = await fetch(`${GHL}/contacts/upsert`, { method: "POST", headers: H,
      body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, email, firstName: meno, phone: tel, source: ZDROJ,
                             customFields: polia(base, o) }) });
    const upd = await up.json().catch(() => ({}));
    const id = upd.contact && upd.contact.id;
    if (!up.ok || !id) { console.error("rozhovor upsert", up.status, JSON.stringify(upd).slice(0, 300)); return json({ ok: false, error: "ghl_contact" }, 502); }

    // 🔴 200 OK nie je dôkaz: Miriam volá na číslo z kontaktu
    const c = ((await (await fetch(`${GHL}/contacts/${id}`, { headers: H })).json().catch(() => ({}))).contact) || {};
    /* GHL číslo ku kontaktu ticho nepriradí v dvoch prípadoch a upsert aj tak vráti 200 so starým číslom:
       1. číslo nepovažuje za platné (napríklad 0900…): povedať človeku, nech ho skontroluje,
       2. 🔴 číslo už má iný kontakt (žena tu už bola s iným e-mailom, napríklad pri diagnostike).
          Predtým to tiež hlásilo „zlé číslo“ a hovor sa nedal rezervovať (28. 10. 2026, Jano).
          Teraz rezervácia pokračuje na kontakte z formulára, číslo je v termíne, v poznámke aj v SMS
          Miriam a potvrdzujúca SMS ide cez kontakt, ktorý to číslo má. */
    let smsKontakt = id, inyKontakt = null;
    if (c.phone !== tel) {
      const dr = await fetch(`${GHL}/contacts/search/duplicate?locationId=${env.GHL_LOCATION_ID}&number=${encodeURIComponent(tel)}`, { headers: H });
      const dup = ((await dr.json().catch(() => ({}))).contact) || null;
      if (!dup || !dup.id || dup.id === id) {
        console.error("rozhovor: telefón sa neuložil", tel, c.phone);
        return json({ ok: false, error: "bad_phone" }, 400);
      }
      inyKontakt = smsKontakt = dup.id;
      console.log("rozhovor: číslo má iný kontakt", dup.id, "rezervácia ide na", id);
    }

    const tg = await fetch(`${GHL}/contacts/${id}/tags`, { method: "POST", headers: H,
      body: JSON.stringify({ tags: [ZNACKA.vsetci, ZNACKA.hovor] }) });
    if (!tg.ok) console.error("rozhovor značka", tg.status);

    const ap = await fetch(`${GHL}/calendars/events/appointments`, { method: "POST", headers: hlavicky(env, "2021-04-15"),
      body: JSON.stringify({ calendarId: KALENDAR_PLAN_ID, locationId: env.GHL_LOCATION_ID, contactId: id,
        assignedUserId: MIRIAM_USER_ID, startTime: new Date(startMs).toISOString(),
        endTime: new Date(startMs + DLZKA_MIN * 60000).toISOString(), title: `Hovor k plánu: ${meno}`,
        appointmentStatus: "confirmed", address: `Telefonát, Miriam volá na ${tel}`, toNotify: !ticho }) });
    const apd = await ap.json().catch(() => ({}));
    if (!ap.ok) {
      const t = JSON.stringify(apd).toLowerCase();
      console.error("rozhovor termín", ap.status, t.slice(0, 300));
      if (t.includes("slot") || t.includes("available")) return json({ ok: false, error: "slot_taken" }, 409);
      return json({ ok: false, error: "ghl_appointment" }, 502);
    }

    try {
      const s = await fetch(`${GHL}/opportunities/search?location_id=${env.GHL_LOCATION_ID}&contact_id=${id}&status=open&limit=5`, { headers: H });
      const sd = await s.json().catch(() => ({}));
      if (s.ok && !(sd.opportunities || []).length) {
        const op = await fetch(`${GHL}/opportunities/`, { method: "POST", headers: H,
          body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, pipelineId: PIPELINE_ID, pipelineStageId: FAZA_HOVOR,
            contactId: id, name: `${meno} · ${tel}`, status: "open", source: "Plán od Miriam" }) });
        if (!op.ok) console.error("rozhovor príležitosť", op.status);
      }
    } catch (e) { console.error("rozhovor príležitosť", String(e)); }

    const nt = await fetch(`${GHL}/contacts/${id}/notes`, { method: "POST", headers: H,
      body: JSON.stringify({ body: poznamka(o, base, `Hovor k plánu ${kedyText(startMs)}, Miriam volá na ${tel}.` +
        (inyKontakt ? ` Toto číslo má v GHL aj iný kontakt (${inyKontakt}), pri tomto kontakte sa neuložilo.` : "")) }) });
    if (!nt.ok) console.error("rozhovor poznámka", nt.status);

    if (!ticho) {
      const e = emailPotvrdenie(meno, o, startMs, tel);
      const sms = smsPotvrdenie(startMs), smsM = smsMiriam(meno, tel, startMs, o, base);
      if (!smsOk(sms) || !smsOk(smsM)) console.error("rozhovor: SMS nie je čisté GSM-7 do 160 znakov");
      await Promise.all([
        posli(env, { type: "Email", contactId: id, subject: e.predmet, html: e.html }),
        posli(env, { type: "SMS", contactId: smsKontakt, message: sms }),
        posli(env, { type: "SMS", contactId: MIRIAM_KONTAKT_ID, message: smsM }),
      ]);
    }
    return json({ ok: true });
  } catch (e) {
    console.error("rozhovor: GHL nedostupné", String(e));
    return json({ ok: false, error: "ghl_unreachable" }, 502);
  }
}

/**
 * POST /api/ghl/termin?kluc=…: slovenský dátum termínu pre správy z GHL workflowov.
 *
 * GHL vie dátum termínu vložiť len po anglicky („Tuesday, September 29, 2026 10:00 AM“)
 * a vlastné formátovanie odmietne (overené 30. 9. 2026). Preto workflow na začiatku zavolá
 * tento webhook s {{appointment.start_time}} a {{contact.id}}. Tu sa z toho spraví
 *   termn_text  „v utorok 29. 9. o 10:00“   do e-mailov
 *   termn_sms   „v utorok 29. 9. o 10:00“   bez diakritiky, do SMS (GSM-7)
 * a zapíše sa ku kontaktu. Správy potom používajú {{contact.termn_text}} a {{contact.termn_sms}}.
 *
 * Čas v anglickom tvare je už v časovom pásme lokality (Europe/Bratislava), takže sa
 * nič neprepočítava, len preskladá. Kľúč webhooku je v premennej GHL_WEBHOOK_KLUC.
 */
import { GHL, json, hlavicky, nastavene } from "../../_lib/ghl.js";

const POLE_TEXT = "wWfDGAz4QwNT9c3y14b1";   // contact.termn_text „Termín (text)“
const POLE_SMS = "2mt8Kgsi5jRS0wHThCQr";    // contact.termn_sms  „Termín (SMS)“

const DNI = { monday: "v pondelok", tuesday: "v utorok", wednesday: "v stredu", thursday: "vo štvrtok",
              friday: "v piatok", saturday: "v sobotu", sunday: "v nedeľu" };
const MESIACE = ["january", "february", "march", "april", "may", "june", "july", "august",
                 "september", "october", "november", "december"];
const bezDiakritiky = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "");

/* „Tuesday, September 29, 2026 10:00 AM“ → „v utorok 29. 9. o 10:00“, inak null */
export function slovensky(anglicky) {
  const m = String(anglicky || "").trim().match(/^(\w+),?\s+(\w+)\s+(\d{1,2}),?\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  const den = DNI[m[1].toLowerCase()], mesiac = MESIACE.indexOf(m[2].toLowerCase()) + 1;
  if (!den || !mesiac) return null;
  let h = parseInt(m[5], 10);
  const ampm = (m[7] || "").toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${den} ${parseInt(m[3], 10)}. ${mesiac}. o ${h}:${m[6]}`;
}

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  if (!env.GHL_WEBHOOK_KLUC || url.searchParams.get("kluc") !== env.GHL_WEBHOOK_KLUC) return json({ ok: false }, 401);
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const cd = b.customData || b.custom_data || {};
  const kontakt = String(cd.kontakt || b.kontakt || b.contact_id || b.contactId || "").trim();
  const povodny = cd.termin || b.termin || "";
  const text = slovensky(povodny);
  if (!kontakt || !text) {
    console.error("termin: chýba kontakt alebo dátum", kontakt, String(povodny).slice(0, 60));
    return json({ ok: false, error: "bad_input" }, 400);
  }
  const sms = bezDiakritiky(text);
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);

  const H = hlavicky(env);
  const r = await fetch(`${GHL}/contacts/${kontakt}`, { method: "PUT", headers: H,
    body: JSON.stringify({ customFields: [{ id: POLE_TEXT, value: text }, { id: POLE_SMS, value: sms }] }) });
  if (!r.ok) { console.error("termin: zápis", r.status); return json({ ok: false, error: "ghl_write" }, 502); }
  // 🔴 200 OK nie je dôkaz, čítať späť
  const c = ((await (await fetch(`${GHL}/contacts/${kontakt}`, { headers: H })).json().catch(() => ({}))).contact) || {};
  const pole = Object.fromEntries((c.customFields || []).map((f) => [f.id, f.value]));
  const sedi = pole[POLE_TEXT] === text && pole[POLE_SMS] === sms;
  if (!sedi) console.error("termin: polia sa neuložili");
  return json({ ok: sedi, text, sms }, sedi ? 200 : 502);
}

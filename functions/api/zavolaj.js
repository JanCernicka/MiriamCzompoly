/**
 * POST /api/zavolaj: vyskakovacie okno „Nie si si istá? Zavolám ti do 24 hodín“ (stránka /dispozicia).
 * Žena nechá len krstné meno a telefón, Miriam jej do 24 hodín zavolá na 15 minút.
 *
 *  1. upsert kontaktu podľa telefónu BEZ značiek, telefón prečítať späť
 *  2. značka „zavolaj-mi-24h“ (na ňu sa viaže upozornenie pre Miriam vo workflowe)
 *  3. úloha pre Miriam „Zavolať do 24 h“ s termínom o 24 hodín, aby sa nestratila
 *  4. príležitosť vo fáze „Lead“, ak otvorenú ešte nemá
 * TEST_REZIM=1: nič sa nezapíše, len sa overia údaje a vráti sa úspech.
 */
import { GHL, json, hlavicky, nastavene, MIRIAM_USER_ID, PIPELINE_ID } from "../_lib/ghl.js";

const ZNACKA = "zavolaj-mi-24h";
const ZDROJ = "Zavolaj mi do 24 h (dispozícia)";
const FAZA_LEAD = "e8f6e92b-860a-4014-a2db-332b16cc2ffc";   // „Lead“ v Hlavnom predajnom procese
const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
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
  if (b.website) return json({ ok: true, skipped: true });   // pasca na roboty
  const meno = cisty(b.meno, 60), tel = telefon(b.telefon);
  if (meno.length < 2 || !tel) return json({ ok: false, error: "bad_contact" }, 400);

  if (env.TEST_REZIM === "1") return json({ ok: true, test: true });
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);

  const H = hlavicky(env);
  try {
    const up = await fetch(`${GHL}/contacts/upsert`, { method: "POST", headers: H,
      body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, firstName: meno, phone: tel, source: ZDROJ }) });
    const upd = await up.json().catch(() => ({}));
    const id = upd.contact && upd.contact.id;
    if (!up.ok || !id) { console.error("upsert", up.status, JSON.stringify(upd).slice(0, 300)); return json({ ok: false, error: "ghl_contact" }, 502); }

    // 🔴 200 OK nie je dôkaz, čítať späť
    const c = ((await (await fetch(`${GHL}/contacts/${id}`, { headers: H })).json().catch(() => ({}))).contact) || {};
    if ((c.phone || "").replace(/\D/g, "") !== tel.replace(/\D/g, "")) { console.error("telefón sa neuložil"); return json({ ok: false, error: "ghl_readback" }, 502); }

    const tg = await fetch(`${GHL}/contacts/${id}/tags`, { method: "POST", headers: H, body: JSON.stringify({ tags: [ZNACKA] }) });
    if (!tg.ok) console.error("značka", tg.status);

    const ul = await fetch(`${GHL}/contacts/${id}/tasks`, { method: "POST", headers: H,
      body: JSON.stringify({ title: `Zavolať do 24 h: ${meno}, ${tel}`,
        body: "Chce 15-minútový hovor (okno „Nie si si istá?“ na stránke dispozície).",
        dueDate: new Date(Date.now() + 24 * 3600000).toISOString(), completed: false, assignedTo: MIRIAM_USER_ID }) });
    if (!ul.ok) console.error("úloha", ul.status, (await ul.text()).slice(0, 200));

    try {
      const s = await fetch(`${GHL}/opportunities/search?location_id=${env.GHL_LOCATION_ID}&contact_id=${id}&status=open&limit=5`, { headers: H });
      const sd = await s.json().catch(() => ({}));
      if (s.ok && !(sd.opportunities || []).length) {
        const o = await fetch(`${GHL}/opportunities/`, { method: "POST", headers: H,
          body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, pipelineId: PIPELINE_ID, pipelineStageId: FAZA_LEAD,
            contactId: id, name: `${meno} · ${tel} (zavolať)`, status: "open" }) });
        if (!o.ok) console.error("príležitosť", o.status);
      }
    } catch (e) { console.error("príležitosť", String(e)); }

    return json({ ok: true, contactId: id, uloha: ul.ok });
  } catch (e) {
    console.error("zavolaj", String(e));
    return json({ ok: false, error: "ghl_error" }, 502);
  }
}

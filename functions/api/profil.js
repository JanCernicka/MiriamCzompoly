/**
 * POST /api/profil: koniec testu na /profil, meno + e-mail + 6 odpovedí (lievik „Plán od Miriam“, 12. 10. 2026).
 *
 *  1. skupina podľa Miriam (assets/js/profil-data.js: horúci, vlažný, ostatní)
 *  2. upsert kontaktu BEZ značiek (upsert by existujúce značky prepísal), s poľami plan_*
 *  3. e-mail a polia prečítať späť (200 OK nie je dôkaz)
 *  4. značky plan-test + plan-<skupina> samostatným volaním (spúšťajú sekvencie e-mailov)
 *  5. poznámka s odpoveďami, odkazom na plán a reklamou, z ktorej prišla (utm_content, 2. 11. 2026)
 *  6. vlažným a ostatným e-mail s plánom hneď, cez GHL Conversations (ako /api/navod).
 *     Horúci plán e-mailom nedostanú, Miriam im ho odovzdá na hovore (stránka ich pošle na rezerváciu).
 * TEST_REZIM=1: nič sa nezapíše, len sa overia údaje a vráti sa skupina.
 * TEST_REZIM=ghl-bez-sprav: zapíše sa všetko ako naostro, ale e-mail neodíde.
 */
import { GHL, json, hlavicky, nastavene, prilezitost, FAZA_LEAD } from "../_lib/ghl.js";
import { P, platneOdpovede, polia, ZNACKA, emailPlan, poznamka, POLIA } from "../_lib/profil.js";

const ZDROJ = "Plán od Miriam (/profil)";
const ZDROJ_KARTY = "Plán od Miriam";   // to isté ako pri hovore (/api/rozhovor)
const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;

/* Odkiaľ prišla: utm_content je meno reklamy v Mete. Pole na to v účte nie je, ide do poznámky.
   Pixel vidí len ľudí so súhlasom s cookies, poznámka každého. */
function odkial(u) {
  const x = u && typeof u === "object" ? u : {};
  const v = (k) => cisty(x[k], 100).replace(/[<>]/g, "");
  const zdroj = [v("utm_source"), v("utm_medium"), v("utm_campaign")].filter(Boolean).join(" / ");
  if (v("utm_content")) return `Reklama: ${v("utm_content")}` + (zdroj ? ` (${zdroj})` : "") + ".";
  return zdroj ? `Zdroj: ${zdroj}.` : "Zdroj: bez UTM, teda nie z tlačidla reklamy.";
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  if (cisty(b.website, 200)) return json({ ok: true, skupina: "ostatni" });   // pasca na roboty
  const meno = cisty(b.meno, 60), email = cisty(b.email, 254).toLowerCase();
  if (meno.length < 2 || !isEmail(email)) return json({ ok: false, error: "bad_contact" }, 400);
  if (!platneOdpovede(b.odpovede)) return json({ ok: false, error: "bad_answers" }, 400);
  const o = b.odpovede, skupina = P.skupina(o);

  if (env.TEST_REZIM === "1") {
    console.log("TEST_REZIM: plán neodoslaný", skupina, JSON.stringify(o));
    return json({ ok: true, test: true, skupina });
  }
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);

  const base = new URL(request.url).origin;
  const H = hlavicky(env);
  try {
    const up = await fetch(`${GHL}/contacts/upsert`, { method: "POST", headers: H,
      body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, email, firstName: meno, source: ZDROJ,
                             customFields: polia(base, o) }) });
    const upd = await up.json().catch(() => ({}));
    const id = upd.contact && upd.contact.id;
    if (!up.ok || !id) { console.error("profil upsert", up.status, JSON.stringify(upd).slice(0, 300)); return json({ ok: false, error: "ghl_contact" }, 502); }

    // 🔴 200 OK nie je dôkaz, čítať späť
    const c = ((await (await fetch(`${GHL}/contacts/${id}`, { headers: H })).json().catch(() => ({}))).contact) || {};
    if ((c.email || "").toLowerCase() !== email) { console.error("profil: kontakt sa neuložil"); return json({ ok: false, error: "ghl_readback" }, 502); }
    const odkaz = ((c.customFields || []).find((f) => f.id === POLIA.odkaz) || {}).value;
    if (!odkaz) console.error("profil: polia plan_* sa neuložili");

    const tg = await fetch(`${GHL}/contacts/${id}/tags`, { method: "POST", headers: H,
      body: JSON.stringify({ tags: [ZNACKA.vsetci, ZNACKA[skupina]] }) });
    if (!tg.ok) console.error("profil značka", tg.status);

    const nt = await fetch(`${GHL}/contacts/${id}/notes`, { method: "POST", headers: H,
      body: JSON.stringify({ body: poznamka(o, base, `Test na /profil, skupina: ${skupina}. ${odkial(b.utm)}`) }) });
    if (!nt.ok) console.error("profil poznámka", nt.status);

    // karta v pipeline vo fáze Lead, aby ju Miriam videla v Príležitostiach (3. 11. 2026)
    await prilezitost(env, id, { faza: FAZA_LEAD, nazov: `${meno} · ${email}`, zdroj: ZDROJ_KARTY });

    if (skupina !== "horuci" && env.TEST_REZIM !== "ghl-bez-sprav") {
      const e = emailPlan(meno, o, base);
      const m = await fetch(`${GHL}/conversations/messages`, { method: "POST", headers: hlavicky(env, "2021-04-15"),
        body: JSON.stringify({ type: "Email", contactId: id, subject: e.predmet, html: e.html }) });
      const md = await m.json().catch(() => ({}));
      if (!m.ok || !(md.messageId || md.emailMessageId)) {
        console.error("profil e-mail", m.status, JSON.stringify(md).slice(0, 300));
        return json({ ok: false, error: "ghl_email" }, 502);
      }
    }
    return json({ ok: true, skupina });
  } catch (e) {
    console.error("profil", String(e));
    return json({ ok: false, error: "ghl_error" }, 502);
  }
}

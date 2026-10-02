/**
 * POST /api/ghl/platba?kluc=…&akcia=potvrd|uvolni: platba vopred za diagnostiku (návrh).
 * Volajú ho workflowy GHL krokom Webhook, customData { kontakt: {{contact.id}} }.
 *
 * Termín z /diagnostika-platba vzniká NEPOTVRDENÝ (status „new“) so značkou
 * „diagnostika-caka-na-platbu“. Potom:
 *   akcia=potvrd  Miriam presunie zákazníčku do fázy „Diagnostika zaplatená“ → termín sa potvrdí,
 *                 značka „diagnostika-zaplatena“, „caka-na-platbu“ preč
 *   akcia=uvolni  48 h po rezervácii: ak ešte nie je „diagnostika-zaplatena“, nepotvrdené termíny
 *                 sa zrušia (kalendár sa uvoľní), značka „diagnostika-neuhradena“
 * Správy zákazníčke posiela workflow podľa značiek, nie táto funkcia.
 * Kľúč webhooku je v premennej GHL_WEBHOOK_KLUC (tá istá ako pri /api/ghl/termin).
 */
import { GHL, json, hlavicky, nastavene, KALENDAR_ID } from "../../_lib/ghl.js";

const CAKA = "diagnostika-caka-na-platbu", ZAPLATENA = "diagnostika-zaplatena", NEUHRADENA = "diagnostika-neuhradena";

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  if (!env.GHL_WEBHOOK_KLUC || url.searchParams.get("kluc") !== env.GHL_WEBHOOK_KLUC) return json({ ok: false }, 401);
  const akcia = url.searchParams.get("akcia");
  if (akcia !== "potvrd" && akcia !== "uvolni") return json({ ok: false, error: "bad_action" }, 400);
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const cd = b.customData || {};
  const kontakt = String(cd.kontakt || b.contact_id || "").trim();
  if (!kontakt) return json({ ok: false, error: "no_contact" }, 400);
  if (env.TEST_REZIM === "1") return json({ ok: true, test: true, akcia });
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);

  const H = hlavicky(env), H4 = hlavicky(env, "2021-04-15");
  const c = ((await (await fetch(`${GHL}/contacts/${kontakt}`, { headers: H })).json().catch(() => ({}))).contact) || null;
  if (!c) return json({ ok: false, error: "contact_not_found" }, 404);
  const tagy = c.tags || [];

  // nepotvrdené budúce termíny diagnostiky tohto kontaktu
  const ev = await (await fetch(`${GHL}/contacts/${kontakt}/appointments`, { headers: H4 })).json().catch(() => ({}));
  const cakajuce = (ev.events || []).filter((e) => e.calendarId === KALENDAR_ID && e.appointmentStatus === "new" && Date.parse(e.startTime) > Date.now());

  async function stav(id, appointmentStatus) {
    const r = await fetch(`${GHL}/calendars/events/appointments/${id}`, { method: "PUT", headers: H4, body: JSON.stringify({ appointmentStatus }) });
    return r.ok;
  }
  async function znacky(pridat, odobrat) {
    if (pridat.length) await fetch(`${GHL}/contacts/${kontakt}/tags`, { method: "POST", headers: H, body: JSON.stringify({ tags: pridat }) });
    if (odobrat.length) await fetch(`${GHL}/contacts/${kontakt}/tags`, { method: "DELETE", headers: H, body: JSON.stringify({ tags: odobrat }) });
  }

  if (akcia === "potvrd") {
    const vysledky = [];
    for (const e of cakajuce) vysledky.push(await stav(e.id, "confirmed"));
    await znacky([ZAPLATENA], [CAKA, NEUHRADENA]);
    return json({ ok: vysledky.every(Boolean), potvrdene: vysledky.length });
  }

  // uvolni: platba medzitým prišla → nič nerobiť
  if (tagy.includes(ZAPLATENA)) return json({ ok: true, zaplatene: true, zrusene: 0 });
  const vysledky = [];
  for (const e of cakajuce) vysledky.push(await stav(e.id, "cancelled"));
  await znacky([NEUHRADENA], [CAKA]);
  return json({ ok: vysledky.every(Boolean), zrusene: vysledky.length });
}

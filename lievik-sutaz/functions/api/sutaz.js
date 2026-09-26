/**
 * Cloudflare Pages Function: prihláška do súťaže o 1 000 €.
 *
 * 🔴 PIT žije LEN tu, na serveri, ako secret projektu. Nikdy nie v prehliadači ani v gite.
 *
 * Premenné (Cloudflare → Pages → miriam-sutaz → Settings → Variables):
 *   GHL_API_KEY      secret, pit-... z jej sub-accountu
 *   GHL_LOCATION_ID  id jej sub-accountu
 *
 * Volá sa dvakrát:
 *   krok "email"   hneď po prvej otázke, aby lead nezmizol, keď dotazník nedokončí
 *   krok "hotovo"  po tretej otázke, s menom a telefónom
 * Tagy potom spúšťajú workflowy v GHL, logika je tam, nie tu.
 */

const GHL = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";

// rovnaký dátum ako data-uzavierka v HTML
const UZAVIERKA = Date.parse("2026-10-14T20:00:00+02:00");

const TAGY = {
  email: ["sutaz-1000-zacala"],
  hotovo: ["sutaz-1000-zacala", "sutaz-1000-prihlasena"],
};
const ZDROJ = "Súťaž 1 000 € (lievik)";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const isEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;

// 0907 777 555 -> +421907777555. Zahraničné čísla s + nechá tak.
function telefon(v) {
  let s = String(v || "").replace(/[^\d+]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (s.startsWith("0")) s = "+421" + s.slice(1);
  if (!s.startsWith("+")) s = "+421" + s;
  return s.replace(/\D/g, "").length >= 11 ? s : null;
}

const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  if (Date.now() >= UZAVIERKA) return json({ ok: false, error: "closed" }, 410);

  if (!env.GHL_API_KEY || !env.GHL_LOCATION_ID) {
    // Radšej hlasná chyba než ticho stratený lead.
    console.error("chyba GHL_API_KEY alebo GHL_LOCATION_ID");
    return json({ ok: false, error: "not_configured" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "bad_json" }, 400);
  }

  // pasca na roboty
  if (body.website) return json({ ok: true, skipped: true });

  const krok = body.krok === "hotovo" ? "hotovo" : "email";
  const email = cisty(body.email, 254).toLowerCase();
  if (!isEmail(email)) return json({ ok: false, error: "bad_email" }, 400);

  const payload = {
    locationId: env.GHL_LOCATION_ID,
    email,
    source: ZDROJ,
  };

  if (krok === "hotovo") {
    const meno = cisty(body.meno, 60);
    const tel = telefon(body.telefon);
    if (meno.length < 2) return json({ ok: false, error: "bad_name" }, 400);
    if (!tel) return json({ ok: false, error: "bad_phone" }, 400);
    payload.firstName = meno;
    payload.phone = tel;
  }

  const headers = {
    Authorization: `Bearer ${env.GHL_API_KEY}`,
    Version: VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  try {
    // tagy NIE v upserte: ten by kontaktu, čo už v CRM je, prepísal jeho doterajšie tagy
    const res = await fetch(`${GHL}/contacts/upsert`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    const contact = data.contact || {};
    if (!res.ok || !contact.id) {
      console.error("GHL upsert zlyhal", res.status, JSON.stringify(data).slice(0, 400));
      return json({ ok: false, error: "ghl_error" }, 502);
    }

    const t = await fetch(`${GHL}/contacts/${contact.id}/tags`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tags: TAGY[krok] }),
    });
    if (!t.ok) {
      console.error("GHL tagy zlyhali", t.status, (await t.text()).slice(0, 400));
      return json({ ok: false, error: "ghl_tags" }, 502);
    }
    return json({ ok: true, contactId: contact.id });
  } catch (e) {
    console.error("GHL nedostupné", String(e));
    return json({ ok: false, error: "ghl_unreachable" }, 502);
  }
}

export const onRequestGet = () => json({ ok: false, error: "method_not_allowed" }, 405);

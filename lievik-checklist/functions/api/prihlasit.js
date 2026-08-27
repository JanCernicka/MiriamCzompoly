/**
 * Cloudflare Pages Function: prihlásenie na checklist.
 *
 * 🔴 PIT žije LEN tu, na serveri. Nikdy sa nesmie dostať do prehliadača.
 *
 * Premenné (Cloudflare → Pages → miriam-checklist → Settings → Variables):
 *   GHL_API_KEY      secret, pit-... z jej sub-accountu
 *   GHL_LOCATION_ID  premenná, id jej sub-accountu
 *
 * Robí presne dve veci: založí alebo doplní kontakt a pridá mu tagy.
 * Tagy potom spúšťajú workflowy v GHL, takže tu žiadna logika navyše nie je.
 */

const GHL = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";

// hodnota z formulára -> tag v GHL. Čo nie je v tomto zozname, neprejde.
const TIMING_TAGS = {
  "do-3-mesiacov": "preberam-do-3m",
  "do-roka": "preberam-do-roka",
  "neviem": "preberam-neviem",
  "uz-byvam": "uz-byvam",
};

const TAG_ALL = "checklist-developer";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const isEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;

export async function onRequestPost({ request, env }) {
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

  // pasca na roboty: skutočný človek toto pole nevidí, takže ho nevyplní
  if (body.website) return json({ ok: true, skipped: true });

  const email = (body.email || "").trim().toLowerCase();
  const tag = TIMING_TAGS[body.timing];

  if (!isEmail(email)) return json({ ok: false, error: "bad_email" }, 400);
  if (!tag) return json({ ok: false, error: "bad_timing" }, 400);

  const headers = {
    Authorization: `Bearer ${env.GHL_API_KEY}`,
    Version: VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const payload = {
    locationId: env.GHL_LOCATION_ID,
    email,
    tags: [TAG_ALL, tag],
    source: "Checklist preberanie bytu (Instagram)",
  };

  try {
    const res = await fetch(`${GHL}/contacts/upsert`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("GHL upsert zlyhal", res.status, JSON.stringify(data).slice(0, 400));
      return json({ ok: false, error: "ghl_error" }, 502);
    }

    const contact = data.contact || data;
    return json({ ok: true, contactId: contact.id || null, isNew: data.new ?? null });
  } catch (e) {
    console.error("GHL nedostupné", String(e));
    return json({ ok: false, error: "ghl_unreachable" }, 502);
  }
}

// Na tento endpoint sa chodí len POSTom.
export const onRequestGet = () => json({ ok: false, error: "method_not_allowed" }, 405);

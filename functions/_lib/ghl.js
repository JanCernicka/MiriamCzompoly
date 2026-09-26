/* Spoločné pre funkcie lievika. PIT žije len v secrets projektu, nikdy v gite. */
export const GHL = "https://services.leadconnectorhq.com";
export const LOCATION_TZ = "Europe/Bratislava";

// kalendár „Interiérová diagnostika“ (ten istý ako na /diagnostika, kapacita je spoločná)
export const KALENDAR_ID = "fUjAzOhv2VyiY3XTguPz";
// Miriam, bez assignedUserId vráti GHL 422
export const MIRIAM_USER_ID = "hSQHxikFZUetHZUYqJZO";
// pipeline „Hlavný predajný proces“, fáza „Diagnostika rezervovaná“
export const PIPELINE_ID = "Ue40eB5LDhvgIAOIcDqC";
export const FAZA_REZERVOVANA = "3e4dff82-13e7-47c6-858a-67ba2a36d877";

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const hlavicky = (env, version = "2021-07-28") => ({
  Authorization: `Bearer ${env.GHL_API_KEY}`,
  Version: version,
  "Content-Type": "application/json",
  Accept: "application/json",
});

export const nastavene = (env) => !!(env.GHL_API_KEY && env.GHL_LOCATION_ID);

// voľné termíny: { "2026-09-28": ["2026-09-28T09:00:00+02:00", ...], ... }
export async function volneSloty(env, odMs, doMs) {
  const url = `${GHL}/calendars/${KALENDAR_ID}/free-slots?startDate=${odMs}&endDate=${doMs}&timezone=${encodeURIComponent(LOCATION_TZ)}`;
  const r = await fetch(url, { headers: hlavicky(env, "2021-04-15") });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`free-slots ${r.status}`);
  const out = {};
  for (const [k, v] of Object.entries(d)) if (v && Array.isArray(v.slots)) out[k] = v.slots;
  return out;
}

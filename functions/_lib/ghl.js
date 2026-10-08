/* Spoločné pre funkcie lievika. PIT žije len v secrets projektu, nikdy v gite. */
export const GHL = "https://services.leadconnectorhq.com";
export const LOCATION_TZ = "Europe/Bratislava";

// kalendár „Interiérová diagnostika“ (ten istý ako na /diagnostika, kapacita je spoločná)
export const KALENDAR_ID = "fUjAzOhv2VyiY3XTguPz";
// kalendár „Interiérová diagnostika online“ (od 5. 10. 2026). Samostatný, aby potvrdenie
// z WF3 („u teba doma“, adresa) nechodilo online zákazníčkam. Rezerva 120 min pred a 90 min
// po termíne, lebo Miriam môže byť na diagnostike u niekoho doma. Tá istá Miriam, GHL
// konflikty medzi kalendármi rešpektuje (overené na termíne 9. 10. o 16:30).
export const KALENDAR_ONLINE_ID = "wjoOfJUC7lOPYKU3pUlu";
// kalendár „Bezplatná konzultácia s Miriam Czompoly“ (15 min po telefóne, volá z neho aj bot pri uvítacom hovore).
// Lievik /profil (NÁHĽAD od 8. 10. 2026) z neho len ČÍTA voľné časy. 🔴 Rezervácia doňho zatiaľ nejde:
// má vlastný workflow uvítacieho hovoru, ktorý by poslal iné SMS. Pred spustením rozhodnúť,
// či rozhovor z testu dostane vlastný 20-minútový kalendár.
export const KALENDAR_HOVOR_ID = "ZSPaMWEuejcfthaFxKZt";
// ceny od 5. 10. 2026 (Miriam, zhodné s FAPI aj s návodom „Ako začať s interiérom“)
export const CENA_OSOBNE = 290, CENA_ONLINE = 250;
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
export async function volneSloty(env, odMs, doMs, kalendar = KALENDAR_ID) {
  const url = `${GHL}/calendars/${kalendar}/free-slots?startDate=${odMs}&endDate=${doMs}&timezone=${encodeURIComponent(LOCATION_TZ)}`;
  const r = await fetch(url, { headers: hlavicky(env, "2021-04-15") });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`free-slots ${r.status}`);
  const out = {};
  for (const [k, v] of Object.entries(d)) if (v && Array.isArray(v.slots)) out[k] = v.slots;
  return out;
}

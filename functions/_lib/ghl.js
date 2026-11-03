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
// kalendár „Hovor k plánu (10 min)“ (12. 10. 2026) pre lievik /profil: horúcim z testu
// Miriam po telefóne odovzdá plán. Vlastný kalendár, aby nebežali workflowy iných kalendárov.
// Bez GHL notifikácií a bez Google pozvánky (bola po anglicky), potvrdenie posiela /api/rozhovor.
export const KALENDAR_PLAN_ID = "Mrfqa49pMQPuVyba2nqm";
// ceny od 5. 10. 2026 (Miriam, zhodné s FAPI aj s návodom „Ako začať s interiérom“)
export const CENA_OSOBNE = 290, CENA_ONLINE = 250;
// Miriam, bez assignedUserId vráti GHL 422
export const MIRIAM_USER_ID = "hSQHxikFZUetHZUYqJZO";
// pipeline „Hlavný predajný proces“, fáza „Diagnostika rezervovaná“
export const PIPELINE_ID = "Ue40eB5LDhvgIAOIcDqC";
export const FAZA_REZERVOVANA = "3e4dff82-13e7-47c6-858a-67ba2a36d877";
// fáza „Krátky hovor rezervovaný“ (hovor k plánu z /profil)
export const FAZA_HOVOR = "af9825ca-fb11-4c7b-8efa-fe9e997a3ee7";
// fáza „Lead“: každý, kto odošle otázky na /profil (3. 11. 2026, Jano: „v príležitostiach ich nevidím“)
export const FAZA_LEAD = "e8f6e92b-860a-4014-a2db-332b16cc2ffc";
// kontakt Miriam (+421 918 819 906): SMS o novom hovore k plánu idú sem, ako upozornenia z WF3
export const MIRIAM_KONTAKT_ID = "UQbUlsXxUiimaBoVuMHQ";

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

/* Príležitosť kontaktu v hlavnej pipeline (3. 11. 2026). Kontakt bez otvorenej príležitosti dostane
   novú vo fáze `faza`. Otvorenú v tejto pipeline vo fáze zo zoznamu `posunZ` posunie do `faza`
   (len dopredu: z Lead na hovor, z Lead alebo z hovoru na diagnostiku). Inú otvorenú nechá tak,
   nech sa nikomu neprepíše karta, ktorú Miriam posunula ručne.
   Chyba sa len zapíše do logu, formulár ani rezervácia kvôli nej nespadnú. */
export async function prilezitost(env, contactId, { faza, posunZ = [], nazov, zdroj, hodnota }) {
  const H = hlavicky(env);
  try {
    const s = await fetch(`${GHL}/opportunities/search?location_id=${env.GHL_LOCATION_ID}&contact_id=${contactId}&status=open&limit=5`, { headers: H });
    const sd = await s.json().catch(() => ({}));
    if (!s.ok) { console.error("príležitosť hľadanie", s.status); return null; }
    const otvorene = sd.opportunities || [];
    if (!otvorene.length) {
      const telo = { locationId: env.GHL_LOCATION_ID, pipelineId: PIPELINE_ID, pipelineStageId: faza,
                     contactId, name: nazov, status: "open" };
      if (zdroj) telo.source = zdroj;
      if (hodnota) telo.monetaryValue = hodnota;
      const op = await fetch(`${GHL}/opportunities/`, { method: "POST", headers: H, body: JSON.stringify(telo) });
      if (!op.ok) { console.error("príležitosť založenie", op.status); return null; }
      return "zalozena";
    }
    const x = otvorene.find((o) => o.pipelineId === PIPELINE_ID && posunZ.includes(o.pipelineStageId));
    if (!x) return "uz-ma";
    // 🔴 PUT chce pipelineId aj pipelineStageId (rovnako ako presun v konzole)
    const zmena = { pipelineId: PIPELINE_ID, pipelineStageId: faza };
    if (hodnota && !Number(x.monetaryValue)) zmena.monetaryValue = hodnota;
    const p = await fetch(`${GHL}/opportunities/${x.id}`, { method: "PUT", headers: H, body: JSON.stringify(zmena) });
    if (!p.ok) { console.error("príležitosť posun", p.status); return null; }
    return "posunuta";
  } catch (e) { console.error("príležitosť", String(e)); return null; }
}

/**
 * Zberač merania lievika Miriam Czompoly (Pages projekt miriam-lievik).
 * Podľa GHLtool lievik/06_KONZOLA.md, časť 2. D1 `miriam-lievik` viazaná ako DB.
 *
 *   POST /e          zápis kroku (stránky mimo A/B testu)
 *   GET  /prehlad    čísla pre kartu Lievik v konzole, za heslom STAT_HESLO
 *
 * Stránky pod A/B testom (/diagnostika A aj B, /dakujem) zapisujú do TEJ ISTEJ
 * D1 cez /api/krok na hlavnom webe, aj so stĺpcom `varianta`. Jedna databáza,
 * jedna pravda.
 */

/* 🔴 ZOZNAM JE UZAVRETÝ a čokoľvek mimo neho vráti 400. Stránka odpoveď
 *    NEČÍTA (sendBeacon), takže odmietnutý krok zmizne bez hlásenia. Kto pridá
 *    nový krok na stránku, MUSÍ ho pridať sem, do functions/_lib/meranie.js na
 *    hlavnom webe a do LIEVIK_POPIS v konzole. */
const KROKY = [
  "pristal",            // načítal /diagnostika (A alebo B)
  "scroll-50",          // dostal sa do polovice stránky
  "scroll-90",          // dočítal po pätu
  "klik-cta",           // klikol na tlačidlo, v `meta` je ktoré
  "kalendar-videl",     // kalendár sa mu ukázal na obrazovke
  "termin-rezervovany", // prišiel na /dakujem, teda rezervoval (A aj B tam končia)
  "odisiel",            // zavrel kartu, v `meta` sekundy na stránke
];

/* Lievik „Plán od Miriam“ (/profil, /profil-rezervacia), 3. 11. 2026. Zapisuje ich hlavný web cez
 * /api/krok (assets/js/plan-meranie.js), ten istý zoznam je vo functions/_lib/lievik.js a popisy
 * v konzole (PLAN_POPIS). Poradie = poradie riadkov v konzole. */
const KROKY_PLAN = [
  "plan-pristal",            // načítal /profil (na plan.* je to „/“)
  "plan-video-zvuk",         // pustil si VSL so zvukom
  "plan-video-polovica",     // VSL aspoň do polovice
  "plan-formular-videl",     // otázky sa mu ukázali na obrazovke
  "plan-formular-zacal",     // klikol prvú odpoveď
  "plan-odoslal",            // odoslal otázky, v `meta` skupina (horuci / vlazny / ostatni)
  "plan-rezervacia-pristal", // horúci: prišiel na /profil-rezervacia
  "plan-hovor-rezervovany",  // horúci: rezervoval hovor
];
/* 🔴 Plán sa smie ťahať od tohto okamihu, aj keď je to viac ako 90 dní dozadu (reset štatistiky).
 *    Ten istý čas je vo VERZIE v konzole. */
const PLAN_OD = Date.UTC(2026, 10, 3, 9, 9);
const VSETKY = new Set([...KROKY, ...KROKY_PLAN]);
const zoznam = (a) => a.map((k) => `'${k}'`).join(",");   // len konštanty z kódu, nič od používateľa

const cors = {
  "Access-Control-Allow-Origin": "*",       // len zápis, nič sa nevracia
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (d, s = 200) => new Response(JSON.stringify(d),
  { status: s, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...cors } });

/** Z user agenta len hrubá trieda zariadenia. Samotný UA sa NEUKLADÁ. */
function zariadenie(ua) {
  const u = String(ua || "").toLowerCase();
  if (/ipad|tablet/.test(u)) return "tablet";
  if (/mobi|iphone|android/.test(u)) return "mobil";
  return "desktop";
}

async function zapis(b, env, req) {
  if (!env.DB) return json({ ok: false, error: "bez DB" });
  if (!VSETKY.has(b.krok)) return json({ ok: false, error: "neznámy krok" }, 400);
  const sid = String(b.sid || "").replace(/[^a-z0-9]/gi, "").slice(0, 32);
  if (!sid) return json({ ok: false, error: "chýba sid" }, 400);
  await env.DB.prepare(
    `INSERT INTO udalosti (cas, sid, krok, stranka, kreativa, zdroj, zariadenie, meta, umiestnenie)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(Date.now(), sid, b.krok, String(b.stranka || "").slice(0, 120),
          String(b.kreativa || "").slice(0, 120), String(b.zdroj || "").slice(0, 60),
          zariadenie(req.headers.get("user-agent")),
          b.meta === undefined || b.meta === null ? null : String(b.meta).slice(0, 200),
          String(b.umiestnenie || "").slice(0, 60))
    .run();
  return json({ ok: true });
}

/* 🔴 Počíta sa UNIKÁTNE sid, nie počet udalostí.
 * 🔴 `od` (presný okamih v ms) PREBIJE `dni`. Strop 90 dní dozadu, nikdy budúcnosť. */
/* Pohľad Plán: kroky plánu, a kto z tých, čo odoslali otázky, prišiel na diagnostiku a rezervoval ju
 * (ten istý sid, plan-meranie.js a meranie diagnostiky zdieľajú sessionStorage). */
async function prehladPlan(url, env) {
  const odParam = parseInt(url.searchParams.get("od") || "", 10);
  const strop = Math.min(PLAN_OD, Date.now() - 90 * 86400000);
  const od = Number.isFinite(odParam) ? Math.min(Date.now(), Math.max(strop, odParam)) : PLAN_OD;
  const PLAN = zoznam(KROKY_PLAN);
  const ODOSLALI = `SELECT sid FROM udalosti WHERE krok='plan-odoslal' AND cas >= ?`;
  const kroky = await env.DB.prepare(
    `SELECT krok, COUNT(DISTINCT sid) AS ludi FROM udalosti WHERE krok IN (${PLAN}) AND cas >= ? GROUP BY krok`)
    .bind(od).all();
  const upsell = await env.DB.prepare(
    `SELECT krok, COUNT(DISTINCT sid) AS ludi FROM udalosti
      WHERE krok IN ('pristal','termin-rezervovany') AND cas >= ? AND sid IN (${ODOSLALI}) GROUP BY krok`)
    .bind(od, od).all();
  const skupiny = await env.DB.prepare(
    `SELECT COALESCE(meta,'') AS skupina, COUNT(DISTINCT sid) AS ludi FROM udalosti
      WHERE krok='plan-odoslal' AND cas >= ? GROUP BY 1`).bind(od).all();
  const podlaKreativy = await env.DB.prepare(
    `SELECT COALESCE(NULLIF(kreativa,''),'(bez utm)') AS kreativa,
            COUNT(DISTINCT CASE WHEN krok='plan-pristal'           THEN sid END) AS ludi,
            COUNT(DISTINCT CASE WHEN krok='plan-odoslal'           THEN sid END) AS odoslali,
            COUNT(DISTINCT CASE WHEN krok='plan-hovor-rezervovany' THEN sid END) AS hovor,
            COUNT(DISTINCT CASE WHEN krok='termin-rezervovany'     THEN sid END) AS diagnostika
       FROM udalosti
      WHERE cas >= ? AND (krok IN (${PLAN}) OR (krok='termin-rezervovany' AND sid IN (${ODOSLALI})))
      GROUP BY 1 HAVING ludi + odoslali + hovor + diagnostika > 0 ORDER BY ludi DESC LIMIT 60`).bind(od, od).all();
  const podlaZariadenia = await env.DB.prepare(
    `SELECT zariadenie,
            COUNT(DISTINCT CASE WHEN krok='plan-pristal' THEN sid END) AS ludi,
            COUNT(DISTINCT CASE WHEN krok='plan-odoslal' THEN sid END) AS odoslali
       FROM udalosti WHERE krok IN (${PLAN}) AND cas >= ? GROUP BY zariadenie`).bind(od).all();

  const m = {};
  for (const r of kroky.results) m[r.krok] = r.ludi;
  const u = {};
  for (const r of upsell.results) u[r.krok] = r.ludi;
  m["plan-diagnostika-pristal"] = u["pristal"] || 0;
  m["plan-diagnostika-rezervovana"] = u["termin-rezervovany"] || 0;
  const pristali = m["plan-pristal"] || 0;
  const lievik = [...KROKY_PLAN, "plan-diagnostika-pristal", "plan-diagnostika-rezervovana"].map((k) => ({
    krok: k, ludi: m[k] || 0,
    zPristatia: pristali ? Math.round(((m[k] || 0) / pristali) * 1000) / 10 : null,
  }));
  return json({ ok: true, cast: "plan", od: new Date(od).toISOString(), lievik,
                skupiny: skupiny.results, podlaKreativy: podlaKreativy.results,
                podlaZariadenia: podlaZariadenia.results });
}

async function prehlad(url, env) {
  if (!env.DB) return json({ ok: false, error: "bez DB" }, 500);
  if (url.searchParams.get("cast") === "plan") return prehladPlan(url, env);
  const dni = Math.min(90, Math.max(1, parseInt(url.searchParams.get("dni") || "7", 10) || 7));
  const strop = Date.now() - 90 * 86400000;
  const odParam = parseInt(url.searchParams.get("od") || "", 10);
  const od = Number.isFinite(odParam)
    ? Math.min(Date.now(), Math.max(strop, odParam))
    : Date.now() - dni * 86400000;

  const kroky = await env.DB.prepare(
    `SELECT krok, COUNT(DISTINCT sid) AS ludi FROM udalosti WHERE cas >= ? GROUP BY krok`)
    .bind(od).all();
  const podlaKreativy = await env.DB.prepare(
    `SELECT COALESCE(NULLIF(kreativa,''),'(bez utm)') AS kreativa,
            COUNT(DISTINCT sid) AS ludi,
            COUNT(DISTINCT CASE WHEN krok='klik-cta'           THEN sid END) AS klikli,
            COUNT(DISTINCT CASE WHEN krok='kalendar-videl'     THEN sid END) AS kalendar,
            COUNT(DISTINCT CASE WHEN krok='termin-rezervovany' THEN sid END) AS termin
       FROM udalosti WHERE cas >= ? AND krok IN (${zoznam(KROKY)}) GROUP BY 1 ORDER BY ludi DESC LIMIT 40`)
    .bind(od).all();
  /* 🔴 SCROLL PODĽA ZARIADENIA: či mobil stránku číta, alebo hneď odchádza. */
  const podlaZariadenia = await env.DB.prepare(
    `SELECT zariadenie, COUNT(DISTINCT sid) AS ludi,
            COUNT(DISTINCT CASE WHEN krok='scroll-50' THEN sid END) AS doPolovice,
            COUNT(DISTINCT CASE WHEN krok='klik-cta'  THEN sid END) AS klikli
       FROM udalosti WHERE cas >= ? AND krok IN (${zoznam(KROKY)}) GROUP BY zariadenie`).bind(od).all();
  const cas = await env.DB.prepare(
    `SELECT COUNT(*) AS n, AVG(CAST(meta AS INTEGER)) AS priemer,
            MAX(CAST(meta AS INTEGER)) AS najviac
       FROM udalosti WHERE krok='odisiel' AND cas >= ?`).bind(od).all();

  const m = {};
  for (const r of kroky.results) m[r.krok] = r.ludi;
  const pristali = m["pristal"] || 0;
  const lievik = KROKY.filter((k) => k !== "odisiel").map((k) => ({
    krok: k, ludi: m[k] || 0,
    zPristatia: pristali ? Math.round(((m[k] || 0) / pristali) * 1000) / 10 : null,
  }));
  return json({ ok: true, dni, od: new Date(od).toISOString(), lievik,
                podlaKreativy: podlaKreativy.results,
                podlaZariadenia: podlaZariadenia.results,
                casNaStranke: cas.results[0] });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (url.pathname === "/e" && request.method === "POST") {
      let b; try { b = JSON.parse(await request.text()); } catch (e) { return json({ ok: false }, 400); }
      try { return await zapis(b, env, request); }
      // 🔴 Chyba merania nesmie byť vidieť na stránke. Vrátime 200 a mlčíme.
      catch (e) { return json({ ok: false, error: String(e).slice(0, 80) }); }
    }
    // Čítanie je za heslom. Je to prevádzkové číslo klienta, nie verejné.
    if (url.pathname === "/prehlad") {
      if (!env.STAT_HESLO || url.searchParams.get("heslo") !== env.STAT_HESLO) {
        return json({ ok: false, error: "zlé heslo" }, 401);
      }
      try { return await prehlad(url, env); }
      catch (e) { return json({ ok: false, error: String(e).slice(0, 120) }, 500); }
    }
    return json({ ok: false, error: "not found" }, 404);
  },
};

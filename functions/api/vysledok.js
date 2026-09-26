/**
 * GET /api/vysledok?heslo=&od=: výsledok A/B testu z D1. Volá ho konzola (/api/ab).
 * 🔴 Ráta sa od okamihu, keď test naozaj začal (od), nie po celých dňoch.
 * 🔴 Vždy COUNT(DISTINCT sid). Rozdiel sa hlási, až keď je merateľný.
 */
import { json } from "../_lib/lievik.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (!env.STAT_HESLO || url.searchParams.get("heslo") !== env.STAT_HESLO) return json({ ok: false }, 401);
  if (!env.DB) return json({ ok: false, error: "bez DB" }, 500);
  const strop = Date.now() - 90 * 86400000;
  const odParam = parseInt(url.searchParams.get("od") || "", 10);
  const dni = Math.min(90, Math.max(1, parseInt(url.searchParams.get("dni") || "14", 10) || 14));
  const od = Number.isFinite(odParam) ? Math.min(Date.now(), Math.max(strop, odParam)) : Date.now() - dni * 86400000;

  const r = await env.DB.prepare(
    `SELECT varianta,
            COUNT(DISTINCT CASE WHEN krok='pristal'            THEN sid END) AS pristali,
            COUNT(DISTINCT CASE WHEN krok='scroll-50'          THEN sid END) AS polovica,
            COUNT(DISTINCT CASE WHEN krok='scroll-90'          THEN sid END) AS pata,
            COUNT(DISTINCT CASE WHEN krok='klik-cta'           THEN sid END) AS klikli,
            COUNT(DISTINCT CASE WHEN krok='kalendar-videl'     THEN sid END) AS kalendar,
            COUNT(DISTINCT CASE WHEN krok='termin-rezervovany' THEN sid END) AS termin
       FROM udalosti WHERE cas >= ? AND varianta IS NOT NULL GROUP BY varianta`).bind(od).all();
  const zariadenia = await env.DB.prepare(
    `SELECT varianta, zariadenie, COUNT(DISTINCT sid) AS ludi,
            COUNT(DISTINCT CASE WHEN krok='termin-rezervovany' THEN sid END) AS termin
       FROM udalosti WHERE cas >= ? AND varianta IS NOT NULL GROUP BY varianta, zariadenie`).bind(od).all();
  const tlacidla = await env.DB.prepare(
    `SELECT varianta, COALESCE(NULLIF(meta,''),'(bez popisu)') AS tlacidlo, COUNT(DISTINCT sid) AS ludi
       FROM udalosti WHERE cas >= ? AND varianta IS NOT NULL AND krok='klik-cta'
      GROUP BY varianta, tlacidlo ORDER BY ludi DESC LIMIT 30`).bind(od).all();

  const v = {};
  for (const x of r.results) {
    v[x.varianta] = { ...x, miera: x.pristali ? Math.round((x.termin / x.pristali) * 1000) / 10 : null };
  }
  /* 🔴 Verdikt až pri aspoň 30 návštevách na variantu a |z| >= 1,96. Záverečné
     rozhodnutie Fisherovým testom (GHLtool lievik/03_AB_TEST.md). */
  let zaver = null;
  const A = v.a, B = v.b;
  if (A && B && A.pristali >= 30 && B.pristali >= 30) {
    const p1 = A.termin / A.pristali, p2 = B.termin / B.pristali;
    const p = (A.termin + B.termin) / (A.pristali + B.pristali);
    const se = Math.sqrt(p * (1 - p) * (1 / A.pristali + 1 / B.pristali));
    const z = se > 0 ? (p1 - p2) / se : 0;
    zaver = { z: Math.round(z * 100) / 100, isty: Math.abs(z) >= 1.96,
              vedie: Math.abs(z) < 1.96 ? null : (p1 > p2 ? "a" : "b"),
              rozdielBodov: Math.round((p1 - p2) * 1000) / 10 };
  }
  return json({ ok: true, dni, od: new Date(od).toISOString(), varianty: v, zaver,
                zariadenia: zariadenia.results, tlacidla: tlacidla.results });
}

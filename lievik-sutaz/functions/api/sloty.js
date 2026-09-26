/**
 * GET /api/sloty: voľné termíny diagnostiky na najbližšie dni.
 * Prvých 5 dní, ktoré majú voľno, najviac 8 časov na deň (celé hodiny).
 */
import { json, nastavene, volneSloty } from "../_lib/ghl.js";

export async function onRequestGet({ env }) {
  if (!nastavene(env)) return json({ ok: false, error: "not_configured" }, 500);
  try {
    const teraz = Date.now();
    const sloty = await volneSloty(env, teraz, teraz + 14 * 86400000);
    const days = Object.keys(sloty).sort()
      .map((date) => ({ date, slots: sloty[date].filter((s) => s.slice(14, 16) === "00").slice(0, 8) }))
      .filter((d) => d.slots.length)
      .slice(0, 5);
    return json({ ok: true, days });
  } catch (e) {
    console.error("sloty zlyhali", String(e));
    return json({ ok: false, error: "ghl_error" }, 502);
  }
}

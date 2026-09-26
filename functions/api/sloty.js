/**
 * GET /api/sloty: voľné termíny kalendára diagnostiky pre variantu B.
 * Ten istý kalendár ako GHL widget na variante A, kapacita je spoločná.
 * Prvých 5 dní s voľnom, najviac 8 časov na deň (celé hodiny).
 * TEST_REZIM bez kľúča: termíny podľa skutočného rozvrhu kalendára
 * (pracovné dni 9:00 až 16:00), nič sa nečíta z GHL.
 */
import { json, nastavene, volneSloty } from "../_lib/ghl.js";

function dve(n) { return (n < 10 ? "0" : "") + n; }
function testove() {
  const out = [];
  for (let i = 1; out.length < 5 && i < 20; i++) {
    const d = new Date(Date.now() + i * 86400000);
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bratislava" }).format(d);
    const wd = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Bratislava", weekday: "short" }).format(d);
    if (wd === "Sat" || wd === "Sun") continue;
    const off = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Bratislava", timeZoneName: "shortOffset" })
      .format(d).match(/GMT([+-]\d+)/);
    const h = off ? parseInt(off[1], 10) : 2;
    const o = (h < 0 ? "-" : "+") + dve(Math.abs(h)) + ":00";
    const slots = [];
    for (let x = 9; x <= 16; x++) slots.push(`${key}T${dve(x)}:00:00${o}`);
    out.push({ date: key, slots });
  }
  return out;
}

export async function onRequestGet({ env }) {
  if (!nastavene(env)) {
    if (env.TEST_REZIM === "1") return json({ ok: true, test: true, days: testove() });
    return json({ ok: false, error: "not_configured" }, 500);
  }
  try {
    const teraz = Date.now();
    const sloty = await volneSloty(env, teraz, teraz + 14 * 86400000);
    const days = Object.keys(sloty).sort()
      .map((date) => ({ date, slots: sloty[date].filter((s) => s.slice(14, 16) === "00").slice(0, 8) }))
      .filter((d) => d.slots.length).slice(0, 5);
    return json({ ok: true, days });
  } catch (e) {
    console.error("sloty zlyhali", String(e));
    return json({ ok: false, error: "ghl_error" }, 502);
  }
}

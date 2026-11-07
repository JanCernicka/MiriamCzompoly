/**
 * /api/koncept: rozpísané poznámky a nové e-maily z /kontrola-emailov-q7m2xh uložené NA SERVERI (7. 11. 2026, Jano:
 * „nech sa to ukladá na servery a nech hocikedy sa vráti na ten link, nech to tam má uložené“).
 *
 * GET  /api/koncept?kluc=…&stranka=emaily          → { ok, data, cas }
 * POST { kluc, stranka, zmeny: { p: {id: text}, n?: [...], odoslane?: true } } → { ok, data, cas }
 *
 * Posiela sa len to, čo sa v prehliadači zmenilo, a čas zmeny dáva server. Stará otvorená karta na
 * inom zariadení preto neprepíše novší text: pošle iba polia, ktoré sa upravovali v nej.
 * Prázdny text je tiež zmena (vymazanie sa prenesie na všetky zariadenia).
 * D1 tabuľka `koncepty` sa založí sama. Náhľad (TEST_REZIM=1) ukladá pod „test:…“, ostré dáta nezasiahne.
 * Kľúč len bráni náhodnému spamu, nie je to tajomstvo (je v stránke), rovnako ako pri /api/kontrola.
 */
import { json } from "../_lib/ghl.js";

const KLUC = "m8sT3SJqC9YMOgfMqjCW0YEi";
const STRANKY = new Set(["emaily"]);
const MAX_POLI = 80, MAX_TEXT = 4000, MAX_NOVYCH = 20, MAX_DATA = 200000;
const cisty = (v, max) => String(v == null ? "" : v).replace(/\r\n?/g, "\n").slice(0, max);
const idPola = (s) => /^[a-z0-9-]{1,60}$/.test(s);

async function tabulka(env) {
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS koncepty (stranka TEXT PRIMARY KEY, data TEXT NOT NULL, ulozene TEXT NOT NULL)").run();
}
const kluc = (env, stranka) => (env.TEST_REZIM === "1" ? "test:" : "") + stranka;

async function nacitaj(env, stranka) {
  const r = await env.DB.prepare("SELECT data, ulozene FROM koncepty WHERE stranka = ?").bind(kluc(env, stranka)).first();
  if (!r) return { data: { p: {}, n: null, odoslane: null }, cas: null };
  let d; try { d = JSON.parse(r.data); } catch { d = {}; }
  return { data: { p: d.p || {}, n: d.n || null, odoslane: d.odoslane || null }, cas: r.ulozene };
}

function overStranku(stranka, k) {
  if (k !== KLUC) return json({ ok: false, error: "forbidden" }, 403);
  if (!STRANKY.has(stranka)) return json({ ok: false, error: "stranka" }, 400);
  return null;
}

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url), stranka = u.searchParams.get("stranka") || "";
  const zle = overStranku(stranka, u.searchParams.get("kluc")); if (zle) return zle;
  if (!env.DB) return json({ ok: false, error: "bez DB" }, 500);
  await tabulka(env);
  const { data, cas } = await nacitaj(env, stranka);
  return json({ ok: true, data, cas, test: env.TEST_REZIM === "1" || undefined });
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const stranka = String((b && b.stranka) || "");
  const zle = overStranku(stranka, b && b.kluc); if (zle) return zle;
  if (!env.DB) return json({ ok: false, error: "bez DB" }, 500);
  await tabulka(env);

  const z = (b && b.zmeny) || {};
  const teraz = new Date().toISOString();
  const { data } = await nacitaj(env, stranka);
  let pocet = 0;
  for (const [id, text] of Object.entries(z.p || {}).slice(0, MAX_POLI)) {
    if (!idPola(id)) continue;
    data.p[id] = { t: cisty(text, MAX_TEXT), c: teraz }; pocet++;
  }
  if (Array.isArray(z.n)) {
    data.n = { c: teraz, zoznam: z.n.slice(0, MAX_NOVYCH).map((x) => ({
      sekv: cisty(x && x.sekv, 40), miesto: cisty(x && x.miesto, 4), kedy: cisty(x && x.kedy, 120),
      predmet: cisty(x && x.predmet, 200), text: cisty(x && x.text, 3500) })) };
    pocet++;
  }
  if (z.odoslane) { data.odoslane = teraz; pocet++; }
  const s = JSON.stringify(data);
  if (s.length > MAX_DATA) return json({ ok: false, error: "too_long" }, 413);
  if (pocet) {
    await env.DB.prepare("INSERT INTO koncepty (stranka, data, ulozene) VALUES (?, ?, ?) " +
      "ON CONFLICT(stranka) DO UPDATE SET data = excluded.data, ulozene = excluded.ulozene")
      .bind(kluc(env, stranka), s, teraz).run();
  }
  // 🔴 200 OK nie je dôkaz, čítať späť
  const spat = await nacitaj(env, stranka);
  const ok = !pocet || spat.cas === teraz;
  return json({ ok, data: spat.data, cas: spat.cas, error: ok ? undefined : "readback", test: env.TEST_REZIM === "1" || undefined }, ok ? 200 : 500);
}

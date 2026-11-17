/* POST /api/realizacie-foto: nahratie jednej fotky zo správcu realizácií (17. 11. 2026).
   Multipart: heslo, velka, mala. Obe sú JPEG, zmenšené už v prehliadači (veľká najviac 1800 px, malá 960 px),
   každá do 1,9 MB, lebo D1 drží najviac 2 MB v jednom riadku. Vráti id, pod ktorým ich podáva
   /foto-realizacie/<id>-v.jpg a <id>-m.jpg. Fotka sa na webe ukáže až po uložení nastavenia v správcovi. */
import { tabulkaFotiek, zabezpecFotky } from "../_lib/realizacie.js";

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const MAX = 1900000;

export async function onRequestPost({ request, env }) {
  const HESLO = env.SPRAVA_HESLO || env.STAT_HESLO;
  if (!HESLO || !env.DB) return json({ ok: false, chyba: "Správca nie je nastavený." }, 500);
  let f;
  try { f = await request.formData(); } catch { return json({ ok: false, chyba: "Zlá požiadavka." }, 400); }
  if (String(f.get("heslo") || "") !== HESLO) {
    await new Promise((r) => setTimeout(r, 800));
    return json({ ok: false, chyba: "Nesprávne heslo." }, 401);
  }
  const casti = [];
  for (const k of ["velka", "mala"]) {
    const s = f.get(k);
    if (!s || typeof s.arrayBuffer !== "function") return json({ ok: false, chyba: "Fotka chýba." }, 400);
    const b = new Uint8Array(await s.arrayBuffer());
    if (b.length < 1000 || b.length > MAX) return json({ ok: false, chyba: "Fotka je príliš veľká alebo prázdna." }, 400);
    if (b[0] !== 0xff || b[1] !== 0xd8) return json({ ok: false, chyba: "Fotka musí byť vo formáte JPG." }, 400);
    casti.push(b);
  }
  const id = [...crypto.getRandomValues(new Uint8Array(9))].map((x) => (x % 36).toString(36)).join("") + Date.now().toString(36).slice(-4);
  await zabezpecFotky(env);
  const T = tabulkaFotiek(env), teraz = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO ${T} (id, data, kedy) VALUES (?, ?, ?)`).bind(id + "-v", casti[0], teraz),
    env.DB.prepare(`INSERT INTO ${T} (id, data, kedy) VALUES (?, ?, ?)`).bind(id + "-m", casti[1], teraz),
  ]);
  const r = await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${T} WHERE id IN (?, ?)`).bind(id + "-v", id + "-m").first();
  if (!r || r.n !== 2) return json({ ok: false, chyba: "Fotka sa neuložila, skús to znova." }, 500);
  return json({ ok: true, id });
}

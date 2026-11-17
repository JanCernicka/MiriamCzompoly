/* GET /foto-realizacie/<id>-v.jpg a <id>-m.jpg: fotky nahraté v správcovi realizácií (17. 11. 2026), uložené v D1.
   Id sa nikdy nemení, preto sa fotka kešuje natrvalo (prehliadač aj Cloudflare). */
import { tabulkaFotiek, RE_ID_FOTKY } from "../_lib/realizacie.js";

export async function onRequestGet({ request, env, params, waitUntil }) {
  const m = /^([a-z0-9]+)-(v|m)\.jpg$/.exec(String(params.subor || ""));
  if (!m || !RE_ID_FOTKY.test(m[1]) || !env.DB) return new Response("Nenájdené", { status: 404 });
  const kes = caches.default, kluc = new Request(new URL(request.url).toString());
  const zKese = await kes.match(kluc);
  if (zKese) return zKese;
  let r = null;
  try { r = await env.DB.prepare(`SELECT data FROM ${tabulkaFotiek(env)} WHERE id = ?`).bind(`${m[1]}-${m[2]}`).first(); } catch { r = null; }
  if (!r || !r.data) return new Response("Nenájdené", { status: 404, headers: { "cache-control": "no-store" } });
  const odp = new Response(new Uint8Array(r.data), { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=31536000, immutable" } });
  waitUntil(kes.put(kluc, odp.clone()));
  return odp;
}

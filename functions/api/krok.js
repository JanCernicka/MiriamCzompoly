/** POST /api/krok: zápis kroku lievika do D1 aj s variantou. */
import { json, krokZapis } from "../_lib/lievik.js";

export async function onRequestPost({ request, env }) {
  /* 🔴 Náhľady (TEST_REZIM nastavený) do merania NEZAPISUJÚ: D1 je tá istá
     ako naostro a skúšanie stránok by sa započítalo do A/B testu. */
  if (env.TEST_REZIM) return json({ ok: true, nahlad: true });
  let b;
  try { b = JSON.parse(await request.text()); } catch (e) { return json({ ok: false }, 400); }
  /* 🔴 Chyba merania nesmie byť vidieť na stránke. */
  try { return await krokZapis(b, env, request); }
  catch (e) { return json({ ok: false, error: String(e).slice(0, 80) }); }
}

/** POST /api/krok: zápis kroku lievika do D1 aj s variantou. */
import { json, krokZapis } from "../_lib/lievik.js";

export async function onRequestPost({ request, env }) {
  let b;
  try { b = JSON.parse(await request.text()); } catch (e) { return json({ ok: false }, 400); }
  /* 🔴 Chyba merania nesmie byť vidieť na stránke. */
  try { return await krokZapis(b, env, request); }
  catch (e) { return json({ ok: false, error: String(e).slice(0, 80) }); }
}

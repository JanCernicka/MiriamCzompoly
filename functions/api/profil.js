/**
 * POST /api/profil: „pošli mi profil aj do e-mailu“ na /profil-vysledok (NÁHĽAD od 8. 10. 2026).
 *
 * 🔴 Zatiaľ NIE JE zapojené do GHL.
 *   TEST_REZIM=1 (náhľad): overí údaje a vráti úspech, nič sa nezapíše ani neodíde.
 *   Naostro: vráti 503 not_ready.
 * Pred spustením: e-mail s profilom (odkaz na /profil-vysledok s odpoveďami) a séria tipov.
 * Zápis postaviť podľa /api/navod (upsert podľa e-mailu, čítať späť, značka, e-mail cez Conversations API).
 */
import { json } from "../_lib/ghl.js";
import { platneOdpovede } from "../_lib/profil.js";

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }
  const email = String(b.email || "").trim().toLowerCase();
  if (!isEmail(email)) return json({ ok: false, error: "bad_email" }, 400);
  if (!platneOdpovede(b.odpovede)) return json({ ok: false, error: "bad_answers" }, 400);

  if (env.TEST_REZIM === "1") {
    console.log("TEST_REZIM: profil neodoslaný", JSON.stringify(b.odpovede));
    return json({ ok: true, test: true });
  }
  return json({ ok: false, error: "not_ready" }, 503);
}

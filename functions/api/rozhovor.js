/**
 * POST /api/rozhovor: rezervácia 20-minútového rozhovoru z lievika /profil (NÁHĽAD od 8. 10. 2026).
 *
 * 🔴 Zatiaľ NIE JE zapojené do GHL.
 *   TEST_REZIM=1 (náhľad): overí údaje a vráti úspech, nič sa nezapíše.
 *   Naostro: vráti 503 not_ready.
 * Dôvod: voľné časy berieme z kalendára uvítacieho hovoru (KALENDAR_HOVOR_ID) a ten má vlastný
 * workflow, ktorý by poslal iné SMS. Pred spustením treba s Miriam dohodnúť:
 *   1. kalendár rozhovoru (vlastný, 20 min),
 *   2. potvrdenie a pripomienku (workflow, ktorý pošle aj prosbu o fotky),
 *   3. kam uložiť odpovede z testu, aby ich Miriam videla pred hovorom (polia alebo poznámka na kontakte).
 * Zápis potom postaviť podľa /api/termin (upsert bez značiek, čítať späť, značka, termín, príležitosť).
 */
import { json } from "../_lib/ghl.js";
import { platneOdpovede } from "../_lib/profil.js";

const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length < 255;
const telefonOk = (v) => String(v || "").replace(/\D/g, "").length >= 9;

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }

  const startMs = Date.parse(cisty(b.start, 40));
  if (isNaN(startMs) || startMs < Date.now()) return json({ ok: false, error: "bad_start" }, 400);
  if (cisty(b.meno, 60).length < 2 || !isEmail(cisty(b.email, 254)) || !telefonOk(b.telefon))
    return json({ ok: false, error: "bad_contact" }, 400);
  if (!platneOdpovede(b.odpovede)) return json({ ok: false, error: "bad_answers" }, 400);

  if (env.TEST_REZIM === "1") {
    console.log("TEST_REZIM: rozhovor neodoslaný", new Date(startMs).toISOString(), JSON.stringify(b.odpovede));
    return json({ ok: true, test: true });
  }
  return json({ ok: false, error: "not_ready" }, 503);
}

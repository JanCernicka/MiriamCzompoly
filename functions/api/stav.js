/** GET /api/stav: čo je nastavené, bez prezradenia hodnôt. Volaj po každom nasadení. */
import { json } from "../_lib/lievik.js";

export const onRequestGet = ({ env }) => json({ ok: true,
  abZapnute: env.AB_ZAPNUTE === "1", test: env.TEST_REZIM === "1",
  maKluc: !!env.GHL_API_KEY, maLokalitu: !!env.GHL_LOCATION_ID,
  maDB: !!env.DB, maHeslo: !!env.STAT_HESLO, variantaB: env.VARIANTA_B || null });

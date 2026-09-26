/**
 * /b/*: súbory varianty B (CSS, JS, obrázky) cez proxy z projektu B.
 * 🔴 Idú cez proxy, nie zo súborov tohto projektu, aby B mala vlastné kópie
 *    a nič sa jej nemiešalo s variantou A.
 */
import { B_PREDVOLENA } from "../_lib/lievik.js";

export async function onRequestGet(ctx) {
  const url = new URL(ctx.request.url);
  const ciel = new URL(url.pathname + url.search, ctx.env.VARIANTA_B || B_PREDVOLENA);
  const o = await fetch(ciel.toString(), { redirect: "manual" });
  return new Response(o.body, { status: o.status, headers: o.headers });
}

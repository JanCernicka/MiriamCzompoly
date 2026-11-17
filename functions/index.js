/* Úvodná stránka: galériu realizácií poskladá podľa toho, čo si Miriam nastavila na /sprava-realizacii
   (17. 11. 2026). 🔴 Keby čokoľvek zlyhalo (databáza, nastavenie, úprava), ukáže sa statický index.html
   bez zmeny. Návštevník nikdy nesmie dostať chybovú stránku kvôli galérii. */
import { posledne, uprav } from "./_lib/realizacie.js";

export async function onRequestGet({ request, env }) {
  const odpoved = await env.ASSETS.fetch(request);
  try {
    if (!odpoved.ok || !(odpoved.headers.get("content-type") || "").includes("text/html") || !env.DB) return odpoved;
    const n = await posledne(env);
    if (!n) return odpoved;
    const html = await odpoved.clone().text();
    const nove = uprav(html, n.nastavenie);
    if (nove === html) return odpoved;
    const h = new Headers(odpoved.headers);
    h.delete("content-length"); h.delete("etag");
    h.set("cache-control", "public, max-age=0, must-revalidate");
    return new Response(nove, { status: odpoved.status, headers: h });
  } catch (e) {
    console.error("index: galéria podľa nastavenia zlyhala", String(e));
    return odpoved;
  }
}

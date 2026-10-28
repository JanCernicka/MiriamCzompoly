/**
 * Poddoména plan.miriamczompoly.sk (28. 10. 2026, Jano): len lievik „Plán od Miriam“ pre reklamu.
 * „/“ ukáže /profil a adresa ostane krátka. Lievik, plán, API a súbory idú ďalej ako na www.
 * Všetko ostatné (úvod, služby, diagnostika, blog) presmeruje na www, aby sa človek z lievika
 * cez odkaz „Domov“ nevrátil späť na formulár.
 * 🔴 Na každej inej adrese (www, náhľady) middleware nerobí nič.
 */
const LIEVIK = /^\/(profil|profil-rezervacia|plan|gdpr|robots\.txt)(\.html)?\/?$|^\/(api|assets)\//;

export async function onRequest({ request, next, env }) {
  const url = new URL(request.url);
  if (!url.hostname.startsWith("plan.")) return next();
  if (url.pathname === "/") {
    return env.ASSETS.fetch(new Request(new URL("/profil" + url.search, url), request));
  }
  if (LIEVIK.test(url.pathname)) return next();
  return Response.redirect("https://www.miriamczompoly.sk" + url.pathname + url.search, 302);
}

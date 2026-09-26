/**
 * Stráž projektu miriam-diagnostika-b (varianta B A/B testu /diagnostika).
 *
 * 🔴 Tento projekt má vlastnú verejnú adresu miriam-diagnostika-b.pages.dev.
 *    Keby sa dostala do reklamy alebo do e-mailu, človek by videl stránku,
 *    ale nebežalo by na nej meranie ani /api/termin a rezervácia by zlyhala.
 *    Preto kto príde priamo na stránku, ide na spoločnú adresu s ?ab=b,
 *    UTM aj fbclid sa nesú so sebou.
 *
 * Rozdeľovač na www.miriamczompoly.sk posiela hlavičku `x-mc-most: 1` a tomu
 * sa stránka podá normálne. Obrázky, CSS a JS sa podávajú vždy.
 */
const SPOLOCNA = "https://www.miriamczompoly.sk/diagnostika";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const jeStranka = url.pathname === "/" || url.pathname.endsWith(".html");
    if (jeStranka && request.headers.get("x-mc-most") !== "1") {
      const ciel = new URL(SPOLOCNA);
      url.searchParams.forEach((v, k) => ciel.searchParams.set(k, v));
      ciel.searchParams.set("ab", "b");
      return Response.redirect(ciel.toString(), 302);
    }
    return env.ASSETS.fetch(request);
  },
};

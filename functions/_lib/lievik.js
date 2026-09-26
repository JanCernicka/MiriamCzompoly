/**
 * A/B test stránky /diagnostika a meranie lievika. Podľa GHLtool lievik/03_AB_TEST.md
 * a 06_KONZOLA.md, kód prevzatý z DKP (sutaz/dist/_worker.js).
 *
 *   varianta A  diagnostika.html tohto projektu (dnešná stránka, nemení sa)
 *   varianta B  reverzná proxy na projekt miriam-diagnostika-b
 *   spoločné    /dakujem (obe varianty tam končia po rezervácii)
 *
 * 🔴 PROXY, NIE PRESMEROVANIE. Reklama má jednu adresu, www.miriamczompoly.sk/diagnostika,
 *    a tá sa nesmie meniť (reštart učiacej fázy). Presmerovanie by zhodilo utm aj fbclid.
 * 🔴 CACHE: každá HTML odpoveď má no-store a Vary: Cookie, inak by CDN podávala
 *    jednu variantu všetkým.
 *
 * Premenné projektu miriam-web-staging:
 *   AB_ZAPNUTE   "1" = delí 50/50. Inak dostane každý A a delí sa len ?ab=a|b (kontrola).
 *   VARIANTA_B   adresa projektu B
 *   TEST_REZIM   "1" = rezervácia nič nezapíše do GHL, len predstiera úspech
 *   STAT_HESLO   heslo k /api/vysledok (to isté ako v zberači a v konzole)
 *   GHL_API_KEY, GHL_LOCATION_ID  pre kalendár a rezerváciu na variante B
 *   DB           D1 miriam-lievik
 */

export const COOKIE = "mc_ab";
export const DNI = 30;
export const B_PREDVOLENA = "https://miriam-diagnostika-b.pages.dev";

/* 🔴 ZOZNAM JE UZAVRETÝ. Musí sedieť so zberačom (meranie/zberac/dist/_worker.js)
   a s LIEVIK_POPIS v konzole. Inak krok potichu chýba. */
export const KROKY = ["pristal", "scroll-50", "scroll-90", "klik-cta",
  "kalendar-videl", "termin-rezervovany", "odisiel"];

/* 🔴 Roboti dostanú vždy A a NEDOSTANÚ cookie (crawler Mety pri schvaľovaní reklamy). */
const ROBOT = /facebookexternalhit|meta-externalagent|facebookcatalog|bingbot|googlebot|google-inspectiontool|yandex|applebot|slurp|duckduckbot|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|preview|headlesschrome|lighthouse|pingdom|uptimerobot|curl|wget|python-requests/i;

export const json = (o, s = 200) => new Response(JSON.stringify(o),
  { status: s, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export function citajCookie(req, meno) {
  const c = req.headers.get("cookie") || "";
  const m = c.match(new RegExp("(?:^|;\\s*)" + meno + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

/** Poradie je zámerné: 1. ?ab=  2. cookie  3. robot  4. náhoda (len keď je test zapnutý). */
export function rozhodni(url, req, env) {
  const nutene = (url.searchParams.get("ab") || "").toLowerCase();
  if (nutene === "a" || nutene === "b") return { v: nutene, nova: true, dovod: "parameter" };
  const c = citajCookie(req, COOKIE);
  if (c === "a" || c === "b") return { v: c, nova: false, dovod: "cookie" };
  if (ROBOT.test(req.headers.get("user-agent") || "")) return { v: "a", nova: false, dovod: "robot" };
  if (env.AB_ZAPNUTE !== "1") return { v: "a", nova: false, dovod: "test-vypnuty" };
  return { v: Math.random() < 0.5 ? "a" : "b", nova: true, dovod: "nahoda" };
}

/* ── meranie ─────────────────────────────────────────────────────────────
   🔴 Návšteva sa hlási v <head>, nie pred </body>. Varianta s ťažkým videom by
      inak hlásila menej návštev (DKP: 105 ku 95 pri férovom delení).
   🔴 UTM sa držia celú session (drz), aj na /dakujem, kam sa prechádza bez nich.
   🔴 Vnútri rámčeka (GHL kalendár presmeruje na /dakujem najprv v iframe) sa
      nemeria nič, stránka sa hneď otvorí v celom okne a zmeria sa tam. */
function hlava(varianta) {
  return `
<script>
(function(){
  try {
    if (window.top !== window.self) return;
    var AB = ${JSON.stringify(varianta)};
    window.LIEVIK_AB = AB;
    var s = sessionStorage.getItem("lievik_sid");
    if (!s) { s = ((window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random())
                .replace(/[^a-z0-9]/gi, "").slice(0, 32);
              sessionStorage.setItem("lievik_sid", s); }
    window.LIEVIK_SID = s;
    function drz(k, p){ var q = new URLSearchParams(location.search).get(p);
      if (q) sessionStorage.setItem("lievik_" + k, q); return sessionStorage.getItem("lievik_" + k) || ""; }
    window.LIEVIK_DRZ = drz;
    var telo = JSON.stringify({ sid: s, ab: AB,
      krok: /^\\/dakujem/.test(location.pathname) ? "termin-rezervovany" : "pristal",
      stranka: location.pathname, kreativa: drz("kreativa", "utm_content"),
      zdroj: drz("zdroj", "utm_source"), umiestnenie: drz("umiestnenie", "utm_term") });
    /* text/plain zámerne: iný typ spustí preflight a beacon pri odchode nestihne */
    if (!(navigator.sendBeacon && navigator.sendBeacon("/api/krok", new Blob([telo], {type:"text/plain"}))))
      fetch("/api/krok", {method:"POST", body:telo, keepalive:true});
    window.LIEVIK_PRISTAL = 1;
  } catch(e){}
})();
<\/script>`;
}

/* Zvyšok merania potrebuje DOM, ide pred </body>. ROVNAKÝ pre obe varianty. */
function koniec() {
  return `
<script>
(function(){
  try {
    if (window.top !== window.self || !window.LIEVIK_SID) return;
    var AB = window.LIEVIK_AB, SID = window.LIEVIK_SID, drz = window.LIEVIK_DRZ;
    function krok(k, meta){
      try {
        var telo = JSON.stringify({ sid: SID, ab: AB, krok: k, meta: meta === undefined ? null : meta,
          stranka: location.pathname, kreativa: drz("kreativa","utm_content"),
          zdroj: drz("zdroj","utm_source"), umiestnenie: drz("umiestnenie","utm_term") });
        if (!(navigator.sendBeacon && navigator.sendBeacon("/api/krok", new Blob([telo], {type:"text/plain"}))))
          fetch("/api/krok", {method:"POST", body:telo, keepalive:true});
      } catch(e){}
    }
    window.krokLievika = krok;
    var zaciatok = Date.now();
    addEventListener("pagehide", function(){ krok("odisiel", String(Math.round((Date.now() - zaciatok) / 1000))); });
    if (/^\\/dakujem/.test(location.pathname)) return;   // na /dakujem len príchod a odchod

    var prahy = {};
    addEventListener("scroll", function(){
      var h = document.documentElement, c = h.scrollHeight - h.clientHeight;
      if (c <= 0) return;
      [50, 90].forEach(function(p){
        if (!prahy[p] && (h.scrollTop || scrollY) / c * 100 >= p) { prahy[p] = 1; krok("scroll-" + p); }
      });
    }, { passive: true });

    /* 🔴 Len odkazy-tlačidlá a [data-cta]. Tlačidlá cookie lišty majú tiež triedu
       btn, ale sú to <button>, takže sa nerátajú. Rovnaký výber na A aj B. */
    document.addEventListener("click", function(e){
      var a = e.target.closest && e.target.closest("[data-cta], a.btn");
      if (!a) return;
      var vsetky = [].slice.call(document.querySelectorAll("[data-cta], a.btn"));
      krok("klik-cta", "tlacidlo-" + (vsetky.indexOf(a) + 1));
    }, true);

    /* Medzi príchodom a rezerváciou musí byť krok (03_AB_TEST.md): kalendár sa
       ukázal na obrazovke. A má GHL kalendár v iframe, B vlastný [data-kalendar]. */
    var kal = document.querySelector('[data-kalendar], iframe[src*="widget/booking"]');
    if (kal && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function(z){
        if (z.some(function(x){ return x.isIntersecting; })) { krok("kalendar-videl"); io.disconnect(); }
      }, { threshold: 0.25 });
      io.observe(kal);
    }
  } catch(e){}
})();
<\/script>`;
}

export async function vstrekni(odpoved, varianta) {
  const typ = odpoved.headers.get("content-type") || "";
  if (!typ.includes("text/html")) return odpoved;
  let html = await odpoved.text();
  const h1 = hlava(varianta);
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + h1) : h1 + html;
  const kus = koniec();
  html = html.includes("</body>") ? html.replace("</body>", kus + "\n</body>") : html + kus;
  const h = new Headers(odpoved.headers);
  h.set("content-type", "text/html; charset=utf-8");
  h.delete("content-length");            // 🔴 inak sa predĺžená odpoveď oreže
  h.delete("content-encoding");
  h.delete("etag");
  return new Response(html, { status: odpoved.status, headers: h });
}

/** Hlavičky HTML odpovede pod testom. */
export function hlavicky(odpoved, r) {
  const h = new Headers(odpoved.headers);
  h.set("Cache-Control", "no-store");
  h.append("Vary", "Cookie");
  h.set("x-mc-ab", r.v);
  if (r.nova && r.dovod !== "robot") {
    h.append("Set-Cookie", `${COOKIE}=${r.v}; Path=/; Max-Age=${DNI * 86400}; SameSite=Lax; Secure`);
  }
  return new Response(odpoved.body, { status: odpoved.status, headers: h });
}

/* ── D1 ──────────────────────────────────────────────────────────────── */
export async function krokZapis(b, env, req) {
  if (!env.DB) return json({ ok: false, error: "bez DB" });
  if (!KROKY.includes(b.krok)) return json({ ok: false, error: "neznámy krok" }, 400);
  const sid = String(b.sid || "").replace(/[^a-z0-9]/gi, "").slice(0, 32);
  if (!sid) return json({ ok: false, error: "bez sid" }, 400);
  const ua = String(req.headers.get("user-agent") || "").toLowerCase();
  const zar = /ipad|tablet/.test(ua) ? "tablet" : (/mobi|iphone|android/.test(ua) ? "mobil" : "desktop");
  await env.DB.prepare(
    `INSERT INTO udalosti (cas, sid, krok, stranka, kreativa, zdroj, zariadenie, meta, umiestnenie, varianta)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(Date.now(), sid, b.krok, String(b.stranka || "").slice(0, 120),
          String(b.kreativa || "").slice(0, 120), String(b.zdroj || "").slice(0, 60), zar,
          b.meta === undefined || b.meta === null ? null : String(b.meta).slice(0, 200),
          String(b.umiestnenie || "").slice(0, 60),
          b.ab === "a" || b.ab === "b" ? b.ab : null)
    .run();
  return json({ ok: true });
}

/* Konzola Miriam Czompoly (projekt konzola-miriamczompoly).
 * Zdroj: šablóna Prezentacia/konzola/_worker.js (posledná zmena 24. 8. 2026, konzola
 * nasadená 26. 8.) + karta Lievik z konzola/worker-doplnok.js. Od 26. 9. 2026 je zdroj
 * TU, v repe klienta. Nasadenie: konzola/nasad.sh. Tajomstvá (GHL_API_KEY,
 * GHL_LOCATION_ID, DEMO_TAG, KONZOLA_HESLO, PIPELINE_ID, STAT_HESLO, KALENDAR_ID,
 * KALENDARE_NAVIAC) sú v Cloudflare. Od 4. 10. 2026 vlastný sub-account Miriam, DEMO_TAG=*.
 */
/**
 * Konzola pre klienta. Cloudflare Pages worker.
 *
 * Klient cez ňu robí s GHL a do GHL samotného nikdy nevojde. Tri taby:
 * Konverzácie, Príležitosti, Prehľad.
 *
 *   POST /api/konverzacie   zoznam rozhovorov
 *   POST /api/sprava        správy jedného rozhovoru
 *   POST /api/odpovedz      odoslanie odpovede
 *   POST /api/prilezitosti  pipeline, stage a karty
 *   POST /api/presun        presun karty do iného stage
 *   POST /api/prehlad       čísla do prvého tabu
 *
 * 🔴 PIT nesmie byť v stránke, mal by ho ktokoľvek. Je v premennej prostredia
 *    (GHL_API_KEY) a volá sa odtiaľto, zo servera. To isté GHL_LOCATION_ID:
 *    keby chodilo z prehliadača, stačí ho v konzole prepísať a klient číta
 *    cudzí sub-account.
 *
 * 🔴 DEMO_TAG je izolácia demo konzol na zdieľanom sub-accounte. Kým ich na
 *    jednom účte visí viac, každá vidí VÝHRADNE kontakty so svojím tagom.
 *    Bez toho by si prospekt otvoril konverzácie a prečítal si, čo písal iný
 *    prospekt, aj s jeho číslom. Podrobne v KONZOLA-KLIENTA.md.
 *
 * 🔴 Prázdny alebo nenastavený DEMO_TAG znamená NIČ, nie VŠETKO. Keby
 *    znamenal všetko, zabudnutá premenná by potichu otvorila celý účet.
 *    Predvolený stav je zamknuté a API vráti zrozumiteľnú chybu.
 *
 * 🔴 &tags= na /conversations/search GHL TICHO IGNORUJE. Vráti 200 a rovnaký
 *    počet ako bez neho (overené 21.08.2026: 8, 8, 8 aj pre neexistujúci tag).
 *    Preto sa filtruje TU, na poli `tags`, ktoré je v každej konverzácii.
 */

const GHL = "https://services.leadconnectorhq.com";
const CAS_ZONA = "Europe/Bratislava";

/* Koľko sa ťahá z GHL na jedno načítanie. Demo aj bežný klient sa doň zmestia
   a ušetrí to stránkovanie. Keď to raz prestane stačiť, prejaví sa to ako
   chýbajúce staršie rozhovory, nie ako chyba, tak to sem píšem nahlas. */
const STROP = 100;

function json(o, s = 200) {
  return new Response(JSON.stringify(o), {
    status: s, headers: { "Content-Type": "application/json" },
  });
}

function hlavicky(env, version = "2021-07-28") {
  return {
    Authorization: `Bearer ${env.GHL_API_KEY}`,
    Version: version,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function ghl(env, cesta, moznosti = {}) {
  const r = await fetch(GHL + cesta, {
    ...moznosti,
    headers: { ...hlavicky(env, moznosti.version), ...(moznosti.headers || {}) },
  });
  const t = await r.text();
  let d = null;
  try { d = JSON.parse(t); } catch { d = t; }
  return { ok: r.ok, kod: r.status, d };
}

/* Kontakty jedným volaním namiesto jedného volania na človeka (8. 10. 2026).
   🔴 GHL dovolí 100 volaní za 10 sekúnd. Kalendár a príležitosti predtým brali
   kontakty po jednom (35 a 30 volaní) a pri rýchlom preklikávaní GHL vracalo 429.
   Vyhľadávanie podľa id vracia adresu v `address`, nie v `address1` ako GET na
   kontakt, preto sa to tu zjednotí. Overené 8. 10. 2026 na účte Miriam. */
async function kontaktyNaraz(env, ids) {
  const zoznam = [...new Set((ids || []).filter(Boolean))];
  const out = {};
  for (let i = 0; i < zoznam.length; i += 100) {
    const r = await ghl(env, "/contacts/search", { method: "POST", body: JSON.stringify({
      locationId: env.GHL_LOCATION_ID, pageLimit: 100,
      filters: [{ field: "id", operator: "eq", value: zoznam.slice(i, i + 100) }] }) });
    if (!r.ok) continue;
    for (const c of ((r.d || {}).contacts || [])) {
      if (c && c.id) out[c.id] = { ...c, address1: c.address1 || c.address || "" };
    }
  }
  return out;
}

/* ── zámok ────────────────────────────────────────────────────────────── */

function heslomOk(env, telo) {
  const ma = String((telo && telo.heslo) || "");
  const treba = String(env.KONZOLA_HESLO || "");
  return treba.length > 0 && ma === treba;
}

/* Tag, ktorým je táto konzola oddelená od ostatných na tom istom účte.
   Vracia null, keď nie je nastavený, a to znamená zamknuté. */
function demoTag(env) {
  const t = String(env.DEMO_TAG || "").trim().toLowerCase();
  return t.length ? t : null;
}

/* 🔴 `tag === "*"` prepustí VŠETKO (vlastný sub-account klienta, ako DKP). Kontroluje
   sa tu, na jednom mieste, aby sa na to nedalo zabudnúť v niektorom z volaní. */
function maTag(tagy, tag) {
  if (tag === "*") return true;
  return (tagy || []).some((x) => String(x).trim().toLowerCase() === tag);
}

/* ── konverzácie ──────────────────────────────────────────────────────── */

/* Nevybavené a hľadanie (8. 10. 2026, podľa konzoly DKP).
   `filter: "nevybavene"` = len neprečítané (GHL `status=unread`), inak všetky.
   `hladaj` = časť mena, číslo alebo e-mail (GHL `query`, od dvoch znakov). Hľadá vo
   VŠETKÝCH konverzáciách, nielen v posledných sto (8. 10. ich bolo 117).
   🔴 Číslo s medzerami GHL nenájde, preto sa z neho nechajú len číslice a plus. */
function upravHladanie(q) {
  const s = String(q || "").replace(/\s+/g, " ").trim().slice(0, 60);
  return /^[\d\s+()\/.-]+$/.test(s) ? s.replace(/[^\d+]/g, "") : s;
}

async function konverzacie(env, telo = {}) {
  const tag = demoTag(env);
  const hladaj = upravHladanie(telo.hladaj);
  const nevybavene = telo.filter === "nevybavene" && hladaj.length < 2;
  let q = `/conversations/search?locationId=${env.GHL_LOCATION_ID}&limit=${STROP}`;
  if (nevybavene) q += "&status=unread";
  if (hladaj.length >= 2) q += `&query=${encodeURIComponent(hladaj)}`;
  const [r, n] = await Promise.all([
    ghl(env, q),
    ghl(env, `/conversations/search?locationId=${env.GHL_LOCATION_ID}&limit=${STROP}&status=unread`),
  ]);
  if (!r.ok) return json({ ok: false, error: "GHL nedalo konverzácie", kod: r.kod }, 502);

  const moje = ((r.d || {}).conversations || []).filter((k) => maTag(k.tags, tag));
  // 🔴 Zoznam z konverzácií s tagom konzoly, nie `total` celého účtu (demo konzola by ho prezradila).
  //    Stránka z neho ráta počet na záložke a vynechá práve vybavené, kým ich GHL nedobehne.
  const nevybaveni = n.ok
    ? ((n.d || {}).conversations || []).filter((k) => maTag(k.tags, tag) && (k.unreadCount || 0) > 0)
        .map((k) => ({ contactId: k.contactId, kedy: k.lastMessageDate || k.dateUpdated || "" }))
    : [];

  return json({
    ok: true,
    filter: nevybavene ? "nevybavene" : "vsetky",
    hladaj, nevybaveni,
    konverzacie: moje
      .filter((k) => !nevybavene || (k.unreadCount || 0) > 0)
      .map((k) => ({
        contactId: k.contactId,
        meno: k.fullName || k.contactName || k.companyName || "Bez mena",
        firma: k.companyName || "",
        tel: k.phone || "",
        email: k.email || "",
        posledna: k.lastMessageBody || "",
        kedy: k.lastMessageDate || k.dateUpdated || "",
        smer: k.lastMessageDirection || "",
        neprecitane: k.unreadCount || 0,
      })).sort((a, b) => String(b.kedy).localeCompare(String(a.kedy))),
  });
}

/* Vybavené (8. 10. 2026, podľa konzoly DKP): rozhovor sa v GHL označí ako prečítaný
   a zmizne z nevybavených. Samotné otvorenie ho neoznačí, aby nezmizol skôr,
   než ho niekto vybaví. */
async function oznacVybavene(env, cid) {
  const h = await ghl(env, `/conversations/search?locationId=${env.GHL_LOCATION_ID}&contactId=${cid}`);
  if (!h.ok) return { ok: false, error: "GHL nedalo konverzácie" };
  for (const { id } of ((h.d || {}).conversations || [])) {
    const g = await ghl(env, `/conversations/${id}`);
    if (!g.ok) return { ok: false, error: "GHL nedalo konverzáciu" };
    if (((g.d || {}).unreadCount || 0) === 0) continue;
    const p = await ghl(env, `/conversations/${id}`, { method: "PUT",
      body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, unreadCount: 0 }) });
    if (!p.ok) return { ok: false, error: "GHL zmenu neprijalo" };
    // 🔴 200 nie je dôkaz, prečítaj späť.
    const s = await ghl(env, `/conversations/${id}`);
    if (!s.ok || ((s.d || {}).unreadCount || 0) !== 0) {
      return { ok: false, error: "GHL stále hlási neprečítané" };
    }
  }
  return { ok: true, neprecitane: 0, teraz: new Date().toISOString() };
}

async function vybavene(env, telo) {
  const tag = demoTag(env);
  const cid = String(telo.contactId || "");
  if (!/^[A-Za-z0-9_-]{10,40}$/.test(cid)) return json({ ok: false, error: "chýba kontakt" }, 400);
  // 🔴 To isté overenie ako pri čítaní, contactId chodí z prehliadača.
  const k = await ghl(env, `/contacts/${cid}`);
  if (!k.ok) return json({ ok: false, error: "kontakt sa nenašiel" }, 404);
  if (!maTag(((k.d || {}).contact || {}).tags, tag)) {
    return json({ ok: false, error: "tento rozhovor sem nepatrí" }, 403);
  }
  const v = await oznacVybavene(env, cid);
  return json(v, v.ok ? 200 : 502);
}

/* Čo z konverzácie je správa a čo len udalosť.

   🔴 Rozhoduje sa podľa `messageType`, teda podľa REŤAZCA, nie podľa čísla
   v `type`. Čísla, ktoré GHL naozaj vracia, sa nezhodujú s tým, čo je po
   internete: v tomto účte je 28 príležitosť, 29 živý chat a 31 termín,
   pričom verejné zoznamy tvrdia niečo iné. Reťazec je čitateľný a nemení sa.

   🔴 Do konverzácie padajú aj systémové záznamy. Keby sa vykreslili ako
   správy, klientovi by sa v chate zjavilo „Opportunity created" a nevedel by,
   čo to je. Idú von ako `druh: "udalost"`, čiže tenký riadok, nie bublina. */
const KANALY = {
  TYPE_SMS: "sms",
  TYPE_CUSTOM_SMS: "sms",
  TYPE_CAMPAIGN_SMS: "sms",
  TYPE_SMS_REVIEW_REQUEST: "sms",
  TYPE_EMAIL: "email",
  TYPE_CUSTOM_EMAIL: "email",
  TYPE_CAMPAIGN_EMAIL: "email",
  TYPE_LIVE_CHAT: "chat",
  TYPE_WEBCHAT: "chat",
  TYPE_FACEBOOK: "fb",
  TYPE_CAMPAIGN_FACEBOOK: "fb",
  TYPE_INSTAGRAM: "ig",
  TYPE_WHATSAPP: "whatsapp",
  TYPE_GMB: "gmb",
  TYPE_CAMPAIGN_GMB: "gmb",
  TYPE_REVIEW: "recenzia",
};
const NAZVY_KANALOV = {
  sms: "SMS", email: "E-mail", chat: "Chat na webe", fb: "Messenger",
  ig: "Instagram", whatsapp: "WhatsApp", gmb: "Google", recenzia: "Recenzia",
};
/* Kam sa cez `POST /conversations/messages` naozaj dá odpísať. Recenzia
   a Google sa odtiaľto poslať nedajú, tie ostávajú len na čítanie. */
const POSIELATELNE = {
  sms: "SMS", email: "Email", chat: "Live_Chat",
  fb: "FB", ig: "IG", whatsapp: "WhatsApp",
};
const UDALOSTI = {
  TYPE_ACTIVITY_INVOICE: "Faktúra",
  TYPE_ACTIVITY_PAYMENT: "Platba",
  TYPE_ACTIVITY_OPPORTUNITY: "Zákazka",
  TYPE_ACTIVITY_APPOINTMENT: "Termín",
  TYPE_ACTIVITY_CONTACT: "Kontakt",
  TYPE_LIVE_CHAT_INFO_MESSAGE: "Chat",
  TYPE_CALL: "Hovor",
};

/* Čísla kanálov, ktoré GHL dáva v `messageTypes` na konverzácii. Sú to tie
   isté hodnoty ako v `type`, len zoskupené, takže z nich vieme povedať, čo
   ten rozhovor naozaj obsahuje. Čo tu nie je, konzola neponúkne. */
const CISLA_KANALOV = { 2: "sms", 3: "email", 29: "chat", 30: "chat",
                        11: "fb", 18: "ig", 19: "whatsapp", 15: "gmb" };

/* 🔴 V tele e-mailu GHL vracia aj pätičku s odhlasovacím odkazom a v ňom
   podpísaný token na pár riadkov. V chate to je stena náhodných znakov, ktorá
   s rozhovorom nesúvisí a zaberie viac miesta než samotná správa. Preto sa
   odreže. Kontroluje sa aj slovenská verzia, lebo naše šablóny sú po slovensky. */
function ocistiEmail(text) {
  let t = String(text || "");
  const rezy = [
    /If you no longer wish to receive these emails[\s\S]*$/i,
    /Ak (si )?už nechcete dostávať[\s\S]*$/i,
    /Odhlásiť sa[\s\S]*$/i,
    /\[https?:\/\/[^\]]*unsubscribe[^\]]*\][\s\S]*$/i,
  ];
  for (const r of rezy) t = t.replace(r, "");
  return t.trim();
}

function prelozStav(m) {
  // 🔴 Naplánovaná správa má `scheduled` aj potom, čo ju brána odošle.
  //    Overené 21.08.2026: odišla o 08:00 a o 45 minút mala stále scheduled.
  //    Preto sa nikdy nepíše „nedoručené", to by klienta vyplašilo zbytočne.
  const s = String(m.status || "").toLowerCase();
  if (s === "delivered") return "doručené";
  if (s === "sent") return "odoslané";
  if (s === "scheduled" || s === "pending") return "odosiela sa";
  if (s === "failed" || s === "undelivered") return "neodišlo";
  return "";
}

/* GHL píše tieto hlášky po anglicky. V slovenskej konzole nemá klient čítať
   „Opportunity updated" a hádať, čo to znamená. Čo nepoznáme, ide von len ako
   názov udalosti, radšej stroho než po anglicky. */
const HLASKY = {
  "opportunity created": "Zákazka vytvorená",
  "opportunity updated": "Zákazka upravená",
  "opportunity status updated": "Zákazka zmenila stav",
  "your chat has ended": "Chat ukončený",
  "new invoice sent": "Faktúra odoslaná",
  "payment received": "Platba prijatá",
};
function popisUdalosti(typ, telo) {
  const t = String(telo || "").trim().toLowerCase();
  return HLASKY[t] || UDALOSTI[typ];
}

async function sprava(env, telo) {
  const tag = demoTag(env);
  const cid = String(telo.contactId || "");
  if (!cid) return json({ ok: false, error: "chýba kontakt" }, 400);

  // 🔴 Overiť tag ZNOVA. Zoznam sa dá obísť, contactId chodí z prehliadača.
  const k = await ghl(env, `/contacts/${cid}`);
  if (!k.ok) return json({ ok: false, error: "kontakt sa nenašiel" }, 404);
  if (!maTag((k.d.contact || {}).tags, tag)) {
    return json({ ok: false, error: "tento rozhovor sem nepatrí" }, 403);
  }

  const h = await ghl(env, `/conversations/search?locationId=${env.GHL_LOCATION_ID}&contactId=${cid}`);
  const konv = ((h.d || {}).conversations || [])[0];
  if (!konv) return json({ ok: true, meno: "", spravy: [] });

  const [m, f] = await Promise.all([
    ghl(env, `/conversations/${konv.id}/messages?limit=${STROP}`, { version: "2021-04-15" }),
    formulare(env, cid),
  ]);
  const zoznam = ((m.d || {}).messages || {}).messages || [];

  const von = [];
  for (const s of zoznam.slice().reverse()) {
    const kanal = KANALY[s.messageType];
    if (kanal) {
      const text = kanal === "email"
        ? ocistiEmail(s.body)
        : String(s.body || "").trim();
      const predmet = ((s.meta || {}).email || {}).subject || "";
      if (!text && !predmet) continue;
      von.push({
        druh: "sprava", kanal, smer: s.direction, text,
        predmet,
        // Na odpoveď do toho istého vlákna treba id E-MAILOVEJ správy,
        // nie id záznamu v konverzácii. Sú to dve rôzne id.
        emailId: (((s.meta || {}).email || {}).messageIds || [])[0] || "",
        kedy: s.dateAdded, stav: prelozStav(s),
      });
    } else if (UDALOSTI[s.messageType]) {
      von.push({ druh: "udalost", kedy: s.dateAdded,
                 text: popisUdalosti(s.messageType, s.body) });
    }
  }
  for (const x of f) von.push(x);
  von.sort((a, b) => String(a.kedy).localeCompare(String(b.kedy)));

  const c = k.d.contact || {};
  return json({
    ok: true,
    meno: `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.companyName || "Bez mena",
    tel: c.phone || "", email: c.email || "",
    kanaly: dostupneKanaly(c, konv, von),
    neprecitane: konv.unreadCount || 0,
    spravy: von,
  });
}

/* Ktoré kanály má konzola pri tomto človeku vôbec ponúknuť.

   Je to to isté pravidlo ako v GHL: čo pri kontakte nemáme, to sa ani
   nezobrazí. Bez čísla nie je SMS, bez e-mailu nie je e-mail, a do Messengeru
   alebo na Instagram sa dá odpísať len tam, kde už nejaká správa prišla,
   lebo bez existujúceho vlákna nie je komu.

   🔴 `messageTypes` na konverzácii je zoznam čísel, nie reťazcov, a nie je
   úplný, keď je vlákno staré. Preto sa berie aj z toho, čo v rozhovore naozaj
   leží. */
function dostupneKanaly(kontakt, konv, spravy) {
  const su = new Set();
  if (String(kontakt.phone || "").trim()) su.add("sms");
  if (String(kontakt.email || "").trim()) su.add("email");
  for (const n of (konv.messageTypes || [])) {
    const k = CISLA_KANALOV[n];
    if (k) su.add(k);
  }
  for (const s of spravy) if (s.druh === "sprava") su.add(s.kanal);

  const dnd = !!kontakt.dnd;
  return [...su].map((k) => ({
    kod: k,
    nazov: NAZVY_KANALOV[k] || k,
    // Recenzia a Google sa odtiaľto poslať nedajú, ostávajú na čítanie.
    posielatelne: !dnd && !!POSIELATELNE[k],
  }));
}

/* Vyplnené formuláre patria do rozhovoru rovnako ako správy. Klient chce
   vidieť, čo mu človek napísal do formulára, nie to hľadať inde.

   🔴 `contactId` v query GHL TICHO IGNORUJE. Vráti 200 a všetky odoslania
   lokácie. Overené 21.08.2026. Filtruje sa preto tu. */
async function formulare(env, contactId) {
  const r = await ghl(env, `/forms/submissions?locationId=${env.GHL_LOCATION_ID}&limit=${STROP}`);
  if (!r.ok) return [];
  return ((r.d || {}).submissions || [])
    .filter((s) => s.contactId === contactId)
    .map((s) => {
      const iné = s.others || {};
      const polia = Object.entries(iné)
        .filter(([k, v]) => typeof v !== "object" && v !== null && v !== ""
          && !TECHNICKE.has(k))
        .map(([k, v]) => ({ nazov: nazovPola(k), hodnota: String(v) }));
      return { druh: "formular", nazov: s.name || "Formulár",
               kedy: s.createdAt || s.dateAdded || "", polia };
    });
}

/* 🔴 `others` nesie okrem vyplnených polí aj technickú omáčku: submissionId,
   signatureHash, orderId, časovú zónu a IP adresu odosielateľa. Klientovi to
   v rozhovore nepatrí, je to preňho šum a IP je navyše osobný údaj, ktorý na
   nič nepotrebuje. Ide von len to, čo človek naozaj vyplnil. */
const TECHNICKE = new Set([
  "formId", "location_id", "submissionId", "signatureHash", "ip", "orderId",
  "Timezone", "timezone", "fbp", "fbc", "eventData", "contactSessionIds",
  "page", "url_params", "referrer", "adSource", "version", "domain",
]);
const NAZVY_POLI = {
  full_name: "Meno", name: "Meno", first_name: "Meno", last_name: "Priezvisko",
  email: "E-mail", phone: "Telefón", payment: "Platba",
  paymentStatus: "Stav platby", message: "Správa", company: "Firma",
};
function nazovPola(k) {
  if (NAZVY_POLI[k]) return NAZVY_POLI[k];
  const t = String(k).replace(/[_-]+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

async function odpovedz(env, telo) {
  const tag = demoTag(env);
  const cid = String(telo.contactId || "");
  const text = String(telo.text || "").trim();
  const kanal = POSIELATELNE[String(telo.kanal || "sms")];
  if (!cid || !text) return json({ ok: false, error: "chýba kontakt alebo text" }, 400);

  // 🔴 To isté overenie ako pri čítaní, a musí byť aj tu. Filtrovať zoznam
  //    nestačí, id kontaktu chodí z prehliadača a dá sa podvrhnúť. Bez tohto
  //    by prospekt na prezentácii napísal SMS komukoľvek v účte.
  const k = await ghl(env, `/contacts/${cid}`);
  if (!k.ok) return json({ ok: false, error: "kontakt sa nenašiel" }, 404);
  const c = k.d.contact || {};
  if (!maTag(c.tags, tag)) {
    return json({ ok: false, error: "tomuto kontaktu sa odtiaľto písať nedá" }, 403);
  }
  if (!kanal) {
    return json({ ok: false, error: "na tento kanál sa odpisovať nedá" }, 400);
  }
  if (kanal === "SMS" && !c.phone) {
    return json({ ok: false, error: "kontakt nemá telefónne číslo" }, 400);
  }
  if (kanal === "Email" && !c.email) {
    return json({ ok: false, error: "kontakt nemá e-mail" }, 400);
  }
  if (c.dnd) return json({ ok: false, error: "kontakt má zakázanú komunikáciu" }, 400);

  // 🔴 Merge polia sa v správach cez API NEROZBAĽUJÚ. {{contact.name}} by
  //    odišlo doslova, tak sa text posiela taký, aký ho klient napísal, a UI
  //    mu žiadne merge polia neponúka.
  let telo2;
  if (kanal === "Email") {
    const predmet = String(telo.predmet || "").trim() || "Odpoveď";
    telo2 = {
      type: "Email", contactId: cid, subject: predmet,
      html: `<p>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`,
    };
    // Odpoveď do toho istého vlákna. Bez toho založí GHL nový e-mail
    // a človeku to v schránke nespadne pod pôvodnú konverzáciu.
    const odpovedNa = String(telo.odpovedNa || "").trim();
    if (odpovedNa) telo2.replyMessageId = odpovedNa;
  } else {
    telo2 = { type: kanal, contactId: cid, message: text };
  }

  const r = await ghl(env, "/conversations/messages",
                      { method: "POST", body: JSON.stringify(telo2) });
  if (!r.ok) {
    return json({ ok: false, error: "GHL správu neprijalo", detail: r.d }, 502);
  }
  return json({ ok: true, messageId: (r.d || {}).messageId || null });
}

/* ── príležitosti ─────────────────────────────────────────────────────── */

/* Ktorú pipeline konzola ukazuje.

   🔴 Nie prvú v poradí. Každý GHL účet má z výroby anglickú „Marketing
   Pipeline" so stĺpcami New Lead, Contacted, Qualified. Keby sa brala prvá,
   klient by v slovenskej konzole videl anglický board a v ňom nula zákaziek,
   lebo tie skutočné sedia v jeho vlastnej pipeline.

   Poradie: premenná PIPELINE_ID, a keď nie je, tá pipeline, v ktorej naozaj
   ležia jeho príležitosti. Až keď nie je ani jedna, prvá v zozname. */
function vyberPipeline(pipeliny, prilezitosti, env) {
  const zPremennej = String(env.PIPELINE_ID || "").trim();
  if (zPremennej) {
    const p = pipeliny.find((x) => x.id === zPremennej);
    if (p) return { pipeline: p, podla: "premenná" };
  }
  const pocty = {};
  for (const x of prilezitosti) pocty[x.pipelineId] = (pocty[x.pipelineId] || 0) + 1;
  const najviac = Object.entries(pocty).sort((a, b) => b[1] - a[1])[0];
  if (najviac) {
    const p = pipeliny.find((x) => x.id === najviac[0]);
    if (p) return { pipeline: p, podla: "kde sú zákazky" };
  }
  return { pipeline: pipeliny[0], podla: "prvá v poradí" };
}

/* Názov štádia na porovnávanie: bez textu v zátvorke, malými písmenami.
   „Diagnostika zaplatená (249 €)" aj po premenovaní na „Diagnostika zaplatená" je ten istý
   kľúč, takže pravidlá a popisy sa pri zmene ceny v názve štádia nerozbijú. */
function kluc(nazov) {
  return String(nazov || "").replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

/* ── pravidlá presunu karty (8. 10. 2026, podľa konzoly DKP) ──
   Jan: „pri miestach s hodnotami treba zadať hodnotu, napr. zaplatil konzultáciu treba
   zadať sumu čo zaplatil, alebo projekt tiež zadať sumu".
     hodnota      true: treba zadať sumu, zapíše sa na kartu (monetaryValue) aj do poznámky
     otazka       popis poľa na sumu v okienku
     predvyplnit  true: okienko ponúkne sumu, ktorá je na karte (pri diagnostike cena z rezervácie)
     dovod        true: treba napísať dôvod, ide do poznámky kontaktu
     rucne        false: ručne sa tam nedá, v okienku je sivé s vetou z `preco`
     stav         stav karty po presune: won, lost, inak open
   Štádium, ktoré tu nie je, sa vybrať dá a karta je po presune otvorená.
   Premenná PRAVIDLA_PRESUNU (JSON v rovnakom tvare, kľúč = názov štádia) ich celé nahradí.
   🔴 Pravidlá platia TU, na serveri. Okienko ich len ukazuje. */
const PRAVIDLA_PREDVOLENE = {
  "diagnostika zaplatená": { hodnota: true, predvyplnit: true, otazka: "Koľko zaplatil za diagnostiku (v eurách)" },
  "projekt vyhraný": { hodnota: true, stav: "won", otazka: "Za koľko je projekt (v eurách)" },
  "realizácia": { hodnota: true, predvyplnit: true, stav: "won", otazka: "Za koľko je projekt (v eurách)" },
  "recenzia / referral": { stav: "won" },
  "projekt prehraný": { dovod: true, stav: "lost" },
};
const STAVY_KARTY = ["open", "won", "lost"];
const BEZ_PRAVIDLA = { rucne: true, preco: "", hodnota: false, dovod: false, stav: "open", otazka: "", predvyplnit: false };

function pravidlaPresunu(env) {
  let p = null;
  try { p = JSON.parse(env.PRAVIDLA_PRESUNU || "null"); } catch { p = null; }
  if (!p || typeof p !== "object" || Array.isArray(p) || !Object.keys(p).length) p = PRAVIDLA_PREDVOLENE;
  const out = {};
  for (const [nazov, r] of Object.entries(p)) {
    const x = r && typeof r === "object" ? r : {};
    out[kluc(nazov)] = {
      rucne: x.rucne !== false,
      preco: String(x.preco || "").trim(),
      hodnota: x.hodnota === true,
      dovod: x.dovod === true,
      stav: STAVY_KARTY.includes(x.stav) ? x.stav : "open",
      otazka: String(x.otazka || "").trim(),
      predvyplnit: x.predvyplnit === true,
    };
  }
  return out;
}

function pravidloStadia(pravidla, nazov) {
  return pravidla[kluc(nazov)] || BEZ_PRAVIDLA;
}

/* Suma tak, ako ju napíše človek: „290", „3 900", „3900,50", „3.900,50", „3 900 €".
   🔴 „3.900" bez čiarky sa ODMIETNE: je to 3 900 alebo 3,9? Nehádame. Rovnaká funkcia je v stránke. */
function hodnotaEur(x) {
  let n;
  if (typeof x === "number") n = x;
  else {
    let s = String(x == null ? "" : x).replace(/[\s  ]/g, "").replace(/(€|eur)$/i, "");
    if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
    else if (s.includes(",")) s = s.replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
    n = Number(s);
  }
  if (!Number.isFinite(n) || n <= 0 || n > 1e7) return null;
  return Math.round(n * 100) / 100;
}

/* „3 900,00 €" bez Intl.NumberFormat, rovnako všade. */
function eurText(n) {
  return Number(n).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €";
}

/* „8. 10. 2026 o 19:45" v čase Miriam, do poznámky na kontakte. */
function terazText() {
  const c = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: CAS_ZONA,
    day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    hourCycle: "h23" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${Number(c.day)}. ${Number(c.month)}. ${c.year} o ${c.hour}:${c.minute}`;
}

/* 🔴 GHL vráti najviac 100 kariet na jedno volanie. Stránkuje sa cez `startAfter`
   a `startAfterId`, najviac STRANY_KARIET strán. Keď sa nenačíta všetko, konzola to napíše. */
const STRANY_KARIET = 10;
async function vsetkyKarty(env) {
  let karty = [], dalej = "", spolu = null;
  for (let i = 0; i < STRANY_KARIET; i++) {
    const o = await ghl(env,
      `/opportunities/search?location_id=${env.GHL_LOCATION_ID}&limit=${STROP}${dalej}`);
    if (!o.ok) return i ? { ok: true, karty, spolu, neuplne: true } : { ok: false };
    const strana = (o.d || {}).opportunities || [];
    const m = (o.d || {}).meta || {};
    karty = karty.concat(strana);
    if (Number.isFinite(m.total)) spolu = m.total;
    if (strana.length < STROP || !m.startAfterId || (spolu !== null && karty.length >= spolu)) break;
    dalej = `&startAfter=${encodeURIComponent(m.startAfter)}&startAfterId=${encodeURIComponent(m.startAfterId)}`;
  }
  return { ok: true, karty, spolu, neuplne: spolu !== null && karty.length < spolu };
}

/* „pi 9. 10. o 16:30" v čase Miriam. */
const SKRATKY_DNI = { Sun: "ne", Mon: "po", Tue: "ut", Wed: "st", Thu: "št", Fri: "pi", Sat: "so" };
function kratkyTermin(ms) {
  const c = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: CAS_ZONA, weekday: "short",
    day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return `${SKRATKY_DNI[c.weekday] || ""} ${Number(c.day)}. ${Number(c.month)}. o ${c.hour}:${c.minute}`;
}

/* GHL vracia čas termínu raz ako ISO, raz ako „2026-10-09 16:30:00" v miestnom čase. */
function msZo(x) {
  const s = String(x || "");
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(s)) return Date.parse(isoCas(s.slice(0, 10), s.slice(11, 16)));
  return Date.parse(s);
}

/* Čo je na karte okrem mena (8. 10. 2026, podľa konzoly DKP, kde sú na karte polia
   z dotazníka). U Miriam: najbližší termín (alebo posledný, keď ďalší nie je), adresa
   a odkiaľ karta prišla. Termíny z tých istých kalendárov ako záložka Kalendár, jedno
   volanie na kalendár, nie na kartu. Adresy pre najviac 100 naposledy zmenených kariet
   jedným volaním (kontaktyNaraz). */
const STROP_KONTAKTOV_KARIET = 100;
async function detailKariet(env, karty) {
  const teraz = Date.now();
  const kedy = (x) => Date.parse(x.lastStageChangeAt || x.updatedAt || "") || 0;
  const cids = [...new Set(karty.slice().sort((a, b) => kedy(b) - kedy(a))
    .map((x) => (x.contact || {}).id).filter(Boolean))].slice(0, STROP_KONTAKTOV_KARIET);
  const ids = kalendare(env);
  const q = `locationId=${env.GHL_LOCATION_ID}&startTime=${teraz - 30 * 864e5}&endTime=${teraz + 90 * 864e5}`;
  const [zoznamKal, udalosti, kontakty] = await Promise.all([
    ghl(env, `/calendars/?locationId=${env.GHL_LOCATION_ID}`, { version: "2021-04-15" }),
    Promise.all(ids.map((id) => ghl(env, `/calendars/events?${q}&calendarId=${id}`, { version: "2021-04-15" }))),
    kontaktyNaraz(env, cids),
  ]);
  const nazvyKal = {};
  for (const k of (((zoznamKal.d || {}).calendars) || [])) nazvyKal[k.id] = k.name || "";
  const terminy = {};
  for (const u of udalosti) {
    for (const e of (((u.d || {}).events) || [])) {
      if (!e.contactId || String(e.appointmentStatus || "") === "cancelled") continue;
      const ms = msZo(e.startTime);
      if (!Number.isFinite(ms)) continue;
      const t = terminy[e.contactId] = terminy[e.contactId] || {};
      const z = { ms, co: nazvyKal[e.calendarId] || e.title || "Termín" };
      // termín, ktorý začal pred menej ako 3 hodinami, ešte beží, berie sa ako ďalší
      if (ms >= teraz - 3 * 3600e3) { if (!t.dalsi || ms < t.dalsi.ms) t.dalsi = z; }
      else if (!t.posledny || ms > t.posledny.ms) t.posledny = z;
    }
  }
  const out = {};
  cids.forEach((cid) => {
    const c = kontakty[cid] || {};
    out[cid] = { adresa: [c.address1, c.city].filter(Boolean).join(", ") };
  });
  for (const [cid, t] of Object.entries(terminy)) {
    out[cid] = out[cid] || {};
    out[cid].termin = t.dalsi ? { nazov: "Termín", ...t.dalsi } : t.posledny ? { nazov: "Bol termín", ...t.posledny } : null;
  }
  return out;
}

function poliaKarty(x, d) {
  const polia = [];
  if (d && d.termin) polia.push({ nazov: d.termin.nazov, hodnota: `${kratkyTermin(d.termin.ms)}, ${d.termin.co}` });
  if (d && d.adresa && !/^online$/i.test(d.adresa)) polia.push({ nazov: "Adresa", hodnota: d.adresa });
  if (x.source) polia.push({ nazov: "Zdroj", hodnota: x.source });
  return polia;
}

async function prilezitosti(env) {
  const tag = demoTag(env);
  const [p, o] = await Promise.all([
    ghl(env, `/opportunities/pipelines?locationId=${env.GHL_LOCATION_ID}`),
    vsetkyKarty(env),
  ]);
  if (!p.ok) return json({ ok: false, error: "GHL nedalo pipeline" }, 502);
  if (!o.ok) return json({ ok: false, error: "GHL nedalo príležitosti" }, 502);

  // 🔴 Tu sa filtruje na tagoch VNORENÉHO kontaktu, ktoré /opportunities/search
  //    vracia rovno v odpovedi. Preto na to netreba ďalšie volanie na kontakt.
  const tagovane = o.karty.filter((x) => maTag((x.contact || {}).tags, tag));

  const pipeliny = (p.d || {}).pipelines || [];
  if (!pipeliny.length) return json({ ok: false, error: "v účte nie je žiadna pipeline" }, 404);
  const { pipeline, podla } = vyberPipeline(pipeliny, tagovane, env);
  const moje = tagovane.filter((x) => x.pipelineId === pipeline.id);

  // Polia na karte sú bonus: keď zlyhajú, karty sa ukážu aj bez nich.
  let detail = {};
  try { detail = await detailKariet(env, moje); } catch (e) { detail = {}; }
  const pravidla = pravidlaPresunu(env);

  return json({
    ok: true,
    pipeline: pipeline.name,
    vybrana_podla: podla,
    neuplne: !!o.neuplne, spolu: o.spolu,
    stage: (pipeline.stages || []).map((s) => {
      const r = pravidloStadia(pravidla, s.name);
      return { id: s.id, nazov: s.name, kluc: kluc(s.name), rucne: r.rucne, preco: r.preco,
               hodnota: r.hodnota, dovod: r.dovod, otazka: r.otazka, predvyplnit: r.predvyplnit, stav: r.stav };
    }),
    karty: moje.map((x) => ({
      id: x.id, stageId: x.pipelineStageId,
      // kvôli tlačidlu Rozhovor na karte
      contactId: (x.contact || {}).id || "",
      nazov: x.name || (x.contact || {}).name || "Bez názvu",
      firma: (x.contact || {}).companyName || "",
      tel: (x.contact || {}).phone || "",
      hodnota: x.monetaryValue || 0,
      stav: x.status || "open",
      zdroj: x.source || "",
      zmena: x.lastStageChangeAt || x.updatedAt || "",
      polia: poliaKarty(x, detail[(x.contact || {}).id]),
    })),
  });
}

async function presun(env, telo) {
  const tag = demoTag(env);
  const id = String(telo.id || "");
  const stageId = String(telo.stageId || "");
  if (!id || !stageId) return json({ ok: false, error: "chýba karta alebo štádium" }, 400);

  const [o, pl] = await Promise.all([
    ghl(env, `/opportunities/${id}`),
    ghl(env, `/opportunities/pipelines?locationId=${env.GHL_LOCATION_ID}`),
  ]);
  if (!o.ok) return json({ ok: false, error: "príležitosť sa nenašla" }, 404);
  const p = (o.d || {}).opportunity || {};
  if (!maTag((p.contact || {}).tags, tag)) {
    return json({ ok: false, error: "táto karta sem nepatrí" }, 403);
  }
  if (!pl.ok) return json({ ok: false, error: "GHL nedalo pipeline" }, 502);
  const stadia = ((((pl.d || {}).pipelines || []).find((x) => x.id === p.pipelineId)) || {}).stages || [];
  const ciel = stadia.find((s) => s.id === stageId);
  if (!ciel) return json({ ok: false, error: "také štádium v pipeline tejto karty nie je" }, 400);
  if (p.pipelineStageId === stageId) return json({ ok: false, error: "karta už v tomto štádiu je" }, 409);

  const pravidlo = pravidloStadia(pravidlaPresunu(env), ciel.name);
  if (!pravidlo.rucne) {
    return json({ ok: false, error: pravidlo.preco || `Do „${ciel.name}" sa karta presúva sama.` }, 403);
  }
  let hodnota = null;
  if (pravidlo.hodnota) {
    hodnota = hodnotaEur(telo.hodnota);
    if (hodnota === null) {
      return json({ ok: false, error: "Zadajte sumu v eurách, napríklad 290 alebo 3 900,50." }, 400);
    }
  }
  const dovod = pravidlo.dovod ? String(telo.dovod || "").replace(/\s+/g, " ").trim().slice(0, 500) : "";
  if (pravidlo.dovod && dovod.length < 3) {
    return json({ ok: false, error: "Napíšte, prečo zákazník nekúpi." }, 400);
  }
  // Voliteľná veta do poznámky, napríklad z kalendára „Neprišiel na termín pi 9. 10. o 16:30".
  const veta = String(telo.poznamka || "").replace(/\s+/g, " ").trim().slice(0, 300);

  const plan = {
    zo: (stadia.find((s) => s.id === p.pipelineStageId) || {}).name || "",
    do: ciel.name, stav: pravidlo.stav, hodnota, dovod, poznamka: veta,
  };
  if (telo.skusobne === true) return json({ ok: true, skusobne: true, plan });

  // 🔴 PUT chce pipelineId AJ pipelineStageId. Stav ide v tom istom PUTe: karta vrátená
  //    z Projekt prehraný do otvoreného štádia je zase otvorená.
  const zmena = { pipelineId: p.pipelineId, pipelineStageId: stageId, status: pravidlo.stav };
  if (hodnota !== null) zmena.monetaryValue = hodnota;
  const r = await ghl(env, `/opportunities/${id}`, { method: "PUT", body: JSON.stringify(zmena) });
  if (!r.ok) return json({ ok: false, error: "presun sa neuložil", detail: r.d }, 502);

  // 🔴 200 nie je dôkaz, prečítaj späť. Keď `status` v tele PUTu neprejde,
  //    skúsi sa samostatný endpoint na stav.
  const nacitaj = async () => ((await ghl(env, `/opportunities/${id}`)).d || {}).opportunity || {};
  let spat = await nacitaj();
  if (spat.pipelineStageId === stageId && spat.status !== pravidlo.stav) {
    await ghl(env, `/opportunities/${id}/status`, {
      method: "PUT", body: JSON.stringify({ status: pravidlo.stav }),
    });
    spat = await nacitaj();
  }
  if (spat.pipelineStageId !== stageId) {
    return json({ ok: false, error: "presun sa neuložil", stageId: spat.pipelineStageId || "" });
  }
  const overene = spat.status === pravidlo.stav
    && (hodnota === null || Number(spat.monetaryValue) === hodnota);

  // Suma sa na karte prepíše bez stopy (projekt prepíše sumu za diagnostiku) a dôvod
  // na karte nemá kam ísť, preto oboje aj do poznámky kontaktu, s dátumom.
  let poznamka = null;
  const cid = (p.contact || {}).id;
  const casti = [hodnota !== null ? eurText(hodnota) : "", dovod, veta].filter(Boolean);
  if (cid && casti.length) {
    const text = `${ciel.name}: ${casti.join(". ")}\nZapísané v konzole ${terazText()}.`;
    poznamka = (await ghl(env, `/contacts/${cid}/notes`, {
      method: "POST", body: JSON.stringify({ body: text }),
    })).ok;
  }

  const znacka = await oznacPresunom(env, p, ciel.name);
  return json({ ok: true, stageId: spat.pipelineStageId, stav: spat.status || "",
                hodnota: spat.monetaryValue ?? null, overene, poznamka, znacka });
}

/* Presun karty môže spustiť sekvenciu značkou (ako v konzole DKP).
   🔴 GHL trigger `pipeline_stage_updated` sa pri presune cez API NESPUSTÍ (overené na DKP),
   preto by sa sekvencia spúšťala značkou. Mapa `ZNACKY_PRE_STAGE` (JSON {"názov štádia":
   "znacka"}) je zatiaľ PRÁZDNA: u Miriam 8. 10. 2026 nie je zapnutý ani jeden workflow,
   ktorý by mal presun karty niečo poslať. Bez mapy presun nepošle nič. */
async function oznacPresunom(env, prilezitost, nazov) {
  let mapa;
  try { mapa = JSON.parse(env.ZNACKY_PRE_STAGE || "{}"); } catch { return null; }
  if (!mapa || typeof mapa !== "object" || !Object.keys(mapa).length) return null;
  const cid = (prilezitost.contact || {}).id;
  if (!cid) return null;
  const k = Object.keys(mapa).find((x) => kluc(x) === kluc(nazov));
  if (!k) return null;
  const znacka = String(mapa[k] || "").trim().toLowerCase();
  if (!znacka) return null;
  await ghl(env, `/contacts/${cid}/tags`, { method: "POST", body: JSON.stringify({ tags: [znacka] }) });
  // 🔴 Aj tu platí, že 200 nie je dôkaz.
  const kontakt = await ghl(env, `/contacts/${cid}`);
  const tagy = ((kontakt.d || {}).contact || {}).tags || [];
  return tagy.map((x) => String(x).toLowerCase()).includes(znacka) ? znacka : null;
}

/* ── prehľad ──────────────────────────────────────────────────────────── */

/* Štyri čísla, ktoré klient chápe bez vysvetľovania. Žiadne grafy. */
async function prehlad(env) {
  const tag = demoTag(env);
  const teraz = Date.now();
  const tyzden = teraz - 7 * 86400 * 1000;

  const [o, k] = await Promise.all([
    ghl(env, `/opportunities/search?location_id=${env.GHL_LOCATION_ID}&limit=${STROP}`),
    ghl(env, `/conversations/search?locationId=${env.GHL_LOCATION_ID}&limit=${STROP}`),
  ]);
  if (!o.ok) return json({ ok: false, error: "GHL nedalo príležitosti" }, 502);

  const moje = ((o.d || {}).opportunities || [])
    .filter((x) => maTag((x.contact || {}).tags, tag));

  const novych = moje.filter((x) => new Date(x.createdAt || 0).getTime() >= tyzden).length;
  const vyhrate = moje.filter((x) => x.status === "won");
  const trzba = vyhrate.reduce((s, x) => s + (Number(x.monetaryValue) || 0), 0);
  const otvorene = moje.filter((x) => x.status === "open").length;

  const zdroje = {};
  for (const x of moje) {
    const z = (x.source || "").trim() || "neuvedený";
    zdroje[z] = (zdroje[z] || 0) + 1;
  }

  const rozhovory = ((k.d || {}).conversations || []).filter((x) => maTag(x.tags, tag));
  const caka = rozhovory.filter((x) => (x.unreadCount || 0) > 0).length;

  return json({
    ok: true,
    novych, otvorene, trzba, caka,
    zdroje: Object.entries(zdroje).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([nazov, pocet]) => ({ nazov, pocet })),
  });
}

/* ── smerovanie ───────────────────────────────────────────────────────── */

/* ── karta Lievik (GHLtool lievik/06_KONZOLA.md) ────────────────────────── */
/* 🔴 KEDY SA MENIL WEB. Čas je UTC a je to čas NASADENIA. Najnovšia verzia HORE.
 *    KTO PREROBÍ WEB ALEBO ZAPNE A/B TEST, PRIDÁ SEM RIADOK a do prepínača v index.html
 *    voľbu v:<id>. Riadok s ab: true má čas, keď test začal doručovať ľuďom z reklamy. */
const VERZIE = [
  /* A/B delenie 50/50 zapnuté 26. 9. 2026, nasadené 14:29:39 UTC (16:29 miestneho) */
  { id: "diagnostika-ab", nazov: "diagnostika, A/B test (od 26. 9. 16:30)",
    od: Date.UTC(2026, 8, 26, 14, 30), ab: true },
  /* meranie išlo naostro 26. 9. 2026 o 15:28 miestneho času (13:28:38 UTC) */
  { id: "diagnostika", nazov: "diagnostika s meraním (od 26. 9. 15:28)",
    od: Date.UTC(2026, 8, 26, 13, 28) },
];

const ZBERAC = "https://miriam-lievik.pages.dev";
const AB_WORKER = "https://www.miriamczompoly.sk";

async function abTest(env, telo) {
  if (!env.STAT_HESLO) return json({ ok: false, error: "meranie lievika nie je nastavené" }, 501);
  const v = VERZIE.find((x) => x.id === telo.verzia && x.ab) || VERZIE.find((x) => x.ab);
  const dni = Math.min(90, Math.max(1, parseInt(telo.dni || 7, 10) || 7));
  const otazka = v ? `od=${v.od}` : `dni=${dni}`;
  const r = await fetch(`${AB_WORKER}/api/vysledok?heslo=${encodeURIComponent(env.STAT_HESLO)}&${otazka}`);
  const t = await r.text();
  if (!r.ok) return json({ ok: false, error: `web vrátil ${r.status}` }, 502);
  let d; try { d = JSON.parse(t); } catch (e) { d = null; }
  if (!d) return json({ ok: false, error: "web nevrátil JSON" }, 502);
  return json(d);
}

async function lievik(env, telo) {
  if (!env.STAT_HESLO) return json({ ok: false, error: "meranie lievika nie je nastavené" }, 501);
  const v = VERZIE.find((x) => x.id === telo.verzia);
  const dni = Math.min(90, Math.max(1, parseInt(telo.dni || 7, 10) || 7));
  // 🔴 `od` prebíja `dni`; neznáme id padá na dni, nie na chybu
  const otazka = v ? `od=${v.od}` : `dni=${dni}`;
  const r = await fetch(`${ZBERAC}/prehlad?heslo=${encodeURIComponent(env.STAT_HESLO)}&${otazka}`);
  const t = await r.text();
  if (!r.ok) return json({ ok: false, error: `zberač vrátil ${r.status}` }, 502);
  let d; try { d = JSON.parse(t); } catch (e) { d = null; }
  if (!d) return json({ ok: false, error: "zberač nevrátil JSON" }, 502);
  d.verzie = VERZIE.map((x) => ({ id: x.id, nazov: x.nazov, ab: !!x.ab, od: new Date(x.od).toISOString() }));
  d.verzia = v ? v.id : null;
  return json(d);
}


/* ── kalendár ─────────────────────────────────────────────────────────── */

/* Prvá záložka (od 4. 10. 2026, podľa konzoly DKP): týždeň s rezerváciami
   zo VŠETKÝCH kalendárov Miriam a čas, ktorý si zavrela.

   🔴 ZATVORENÝ ČAS SA ZAPISUJE DO GHL ako blokácia POUŽÍVATEĽKY (Miriam), nie
      kalendára. Jej kalendáre nie sú typu „event", na kalendár GHL blokáciu
      odmietne („The calendar is not an event calendar", overené 4. 10. 2026).
      Blokácia používateľky platí pre všetky jej kalendáre naraz: web, bot aj
      uvítací hovor čítajú free-slots a zavretý čas v nich nie je.

   🔴 Blokácie NEVRACIA `GET /calendars/events`, len `GET /calendars/blocked-slots`
      (a len ten dá `id`, bez ktorého sa nedajú zrušiť).

   🔴 Kalendár diagnostiky nemá `openHours`, berie pracovný čas Miriam ako
      používateľky. Preto sa otváracie hodiny skladajú zo všetkých kalendárov
      a keď nemá žiadny, platí PRACOVNY_CAS (po až pi 9 až 17, overené proti
      free-slots 4. 10. 2026). */

const DNI_SK = ["nedeľa", "pondelok", "utorok", "streda", "štvrtok", "piatok", "sobota"];
const PRACOVNY_CAS = { 1: [["09:00", "17:00"]], 2: [["09:00", "17:00"]], 3: [["09:00", "17:00"]],
                       4: [["09:00", "17:00"]], 5: [["09:00", "17:00"]] };
const NAZOV_BLOKU = "Zatvorené v konzole";
// štádium, do ktorého ide karta po „Neprišiel" v okienku termínu (porovnáva sa cez kluc())
const NO_SHOW = "No-show";

/* Kalendáre: prvý je hlavný (z neho sa číta zavretý čas), ďalšie sa ukazujú
   a blokujú s ním. KALENDAR_ID a KALENDARE_NAVIAC (čiarkami). */
function kalendare(env) {
  const vsetky = [env.KALENDAR_ID, ...String(env.KALENDARE_NAVIAC || "").split(",")]
    .map((x) => String(x || "").trim()).filter((x) => /^[A-Za-z0-9]{10,40}$/.test(x));
  return [...new Set(vsetky)];
}

/* Koho blokujeme: prvá vybraná osoba hlavného kalendára (Miriam). */
async function pouzivatel(env) {
  const ids = kalendare(env);
  if (!ids.length) return "";
  const r = await ghl(env, `/calendars/${ids[0]}`, { version: "2021-04-15" });
  const tim = (((r.d || {}).calendar || {}).teamMembers) || [];
  const m = tim.find((x) => x.selected) || tim[0] || {};
  return String(m.userId || "");
}

/* Posun zóny pre daný deň, „+02:00" alebo „+01:00". Pre KAŽDÝ deň zvlášť,
   cez zmenu času by inak polovica týždňa sadla o hodinu. */
function posunZony(datum) {
  const d = new Date(datum + "T12:00:00Z");
  const cast = new Intl.DateTimeFormat("en-GB", { timeZone: CAS_ZONA, timeZoneName: "longOffset" })
    .formatToParts(d).find((p) => p.type === "timeZoneName");
  return String((cast || {}).value || "GMT+00:00").replace("GMT", "") || "+00:00";
}
function isoCas(datum, hhmm) { return `${datum}T${hhmm}:00${posunZony(datum)}`; }
function plusDni(datum, n) {
  const d = new Date(datum + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
/* Dátum a čas v Bratislave z ISO alebo z „2026-10-09 16:30:00" (GHL vracia oboje). */
function vZone(iso) {
  const s = String(iso || "");
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(s)) return { datum: s.slice(0, 10), cas: s.slice(11, 16) };
  const d = new Date(s);
  if (isNaN(d)) return { datum: "", cas: "" };
  const c = new Intl.DateTimeFormat("en-CA", { timeZone: CAS_ZONA, year: "numeric", month: "2-digit",
    day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d)
    .reduce((o, p) => (o[p.type] = p.value, o), {});
  return { datum: `${c.year}-${c.month}-${c.day}`, cas: `${c.hour === "24" ? "00" : c.hour}:${c.minute}` };
}
function minutyZo(hhmm) { const [h, m] = String(hhmm || "0:0").split(":").map(Number); return (h || 0) * 60 + (m || 0); }
function hhmmZ(min) { return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`; }

async function kalendar(env, telo) {
  const ids = kalendare(env);
  if (!ids.length) return json({ ok: false, error: "konzola nemá nastavený kalendár" }, 500);
  const tag = demoTag(env);

  const od = /^\d{4}-\d{2}-\d{2}$/.test(String(telo.od || "")) ? telo.od : vZone(new Date().toISOString()).datum;
  const doDna = plusDni(od, 6);
  const zac = Date.parse(isoCas(od, "00:00")), kon = Date.parse(isoCas(doDna, "23:59"));
  const q = `locationId=${env.GHL_LOCATION_ID}&startTime=${zac}&endTime=${kon}`;

  const kaly = await Promise.all(ids.map(async (id, poradie) => {
    const [k, u] = await Promise.all([
      ghl(env, `/calendars/${id}`, { version: "2021-04-15" }),
      ghl(env, `/calendars/events?${q}&calendarId=${id}`, { version: "2021-04-15" }),
    ]);
    return { id, poradie, k, u, cal: (k.d || {}).calendar || {} };
  }));
  if (!kaly[0].k.ok) return json({ ok: false, error: "GHL nedalo kalendár" }, 502);
  const tim = kaly[0].cal.teamMembers || [];
  const kto = String((tim.find((x) => x.selected) || tim[0] || {}).userId || "");
  const bl = kto ? await ghl(env, `/calendars/blocked-slots?${q}&userId=${kto}`, { version: "2021-04-15" })
                 : { ok: true, d: {} };

  /* Otváracie hodiny: zjednotenie všetkých kalendárov. GHL počíta 0 = nedeľa.
     🔴 `openHours` MUSÍ byť pole, GHL ho vie vrátiť ako `{}`. */
  const hodiny = {};
  for (const x of kaly) {
    for (const o of (Array.isArray(x.cal.openHours) ? x.cal.openHours : [])) {
      for (const den of (o.daysOfTheWeek || [])) {
        for (const h of (o.hours || [])) {
          const usek = [hhmmZ((h.openHour || 0) * 60 + (h.openMinute || 0)), hhmmZ((h.closeHour || 0) * 60 + (h.closeMinute || 0))];
          hodiny[den] = hodiny[den] || [];
          if (!hodiny[den].some(([a, b]) => a === usek[0] && b === usek[1])) hodiny[den].push(usek);
        }
      }
    }
  }
  const zdroj = Object.keys(hodiny).length ? hodiny : PRACOVNY_CAS;
  const krok = Math.min(...kaly.map((x) => Number(x.cal.slotInterval) || Number(x.cal.slotDuration) || 30));

  // termíny zo všetkých kalendárov, mená ľudí z kontaktov
  const terminy = kaly.flatMap((x) => (((x.u.d || {}).events) || [])
    .filter((e) => String(e.appointmentStatus || "") !== "cancelled")
    .map((e) => ({ e, kal: x })));
  // Kontakty jedným volaním (kontaktyNaraz), týždeň ich má ďaleko menej ako 100.
  const idKontaktov = [...new Set(terminy.map((t) => t.e.contactId).filter(Boolean))].slice(0, 100);
  /* Karta k termínu (8. 10. 2026, okienko termínu ako v konzole DKP): v okienku je
     tlačidlo „Neprišiel", ktoré kartu presunie do štádia No-show. Preto treba vedieť,
     ktorá karta patrí k človeku a ktoré štádium je No-show. */
  const [kontakty, pl, op] = await Promise.all([
    kontaktyNaraz(env, idKontaktov),
    ghl(env, `/opportunities/pipelines?locationId=${env.GHL_LOCATION_ID}`),
    ghl(env, `/opportunities/search?location_id=${env.GHL_LOCATION_ID}&limit=${STROP}`),
  ]);
  const vsetkyKartyKal = ((op.d || {}).opportunities || []).filter((x) => maTag((x.contact || {}).tags, tag));
  const pipeliny = (pl.d || {}).pipelines || [];
  const pipeline = pipeliny.length ? vyberPipeline(pipeliny, vsetkyKartyKal, env).pipeline : null;
  const stadia = (pipeline && pipeline.stages) || [];
  const noShow = (stadia.find((s) => kluc(s.name) === kluc(NO_SHOW)) || {}).id || "";
  const kartaKontaktu = {};
  for (const x of vsetkyKartyKal) {
    const cid = (x.contact || {}).id;
    if (!cid || !pipeline || x.pipelineId !== pipeline.id) continue;
    // otvorená karta má prednosť pred uzavretou
    if (kartaKontaktu[cid] && kartaKontaktu[cid].stav === "open") continue;
    kartaKontaktu[cid] = { id: x.id, stageId: x.pipelineStageId, stav: x.status || "open",
      stage: (stadia.find((s) => s.id === x.pipelineStageId) || {}).name || "" };
  }
  const teraz = Date.now();

  const dni = [];
  for (let i = 0; i < 7; i++) {
    const datum = plusDni(od, i);
    const denCislo = new Date(datum + "T12:00:00Z").getUTCDay();
    const otvorene = (zdroj[denCislo] || []).map(([a, b]) => ({ od: a, do: b }));
    if (!otvorene.length) continue;   // zatvorený deň sa nezobrazuje
    dni.push({
      datum, den: DNI_SK[denCislo], otvorene,
      terminy: terminy.filter((t) => vZone(t.e.startTime).datum === datum).map((t) => {
        const c = kontakty[t.e.contactId];
        // 🔴 kontakt mimo tagu konzoly: termín vidno, kto to je a rozhovor nie
        const smie = !!c && maTag(c.tags, tag);
        const meno = smie ? ([c.firstName, c.lastName].filter(Boolean).join(" ") || c.name || c.phone || "Bez mena") : "Rezervované";
        const zaciatokMs = msZo(t.e.startTime);
        const karta = smie ? (kartaKontaktu[t.e.contactId] || null) : null;
        return { id: t.e.id, od: vZone(t.e.startTime).cas, do: vZone(t.e.endTime).cas, meno,
                 co: t.kal.cal.name || "Termín", kal: t.kal.poradie, potvrdeny: t.e.appointmentStatus === "confirmed",
                 contactId: smie ? t.e.contactId : "",
                 zaciatok: Number.isFinite(zaciatokMs) ? new Date(zaciatokMs).toISOString() : "",
                 // adresa z termínu, staršie termíny ju nemajú, vtedy z kontaktu
                 adresa: smie ? (String(t.e.address || "").trim() || [c.address1, c.city].filter(Boolean).join(", ")) : "",
                 tel: smie ? (c.phone || "") : "",
                 karta,
                 // neprišiel = karta je v No-show a termín už bol
                 neprisiel: !!(karta && noShow && karta.stageId === noShow && zaciatokMs < teraz) };
      }),
      zavrete: (((bl.d || {}).events) || []).filter((e) => vZone(e.startTime).datum === datum)
        .map((e) => ({ id: e.id, od: vZone(e.startTime).cas, do: vZone(e.endTime).cas,
                       nazov: e.title || "", zKonzoly: (e.title || "") === NAZOV_BLOKU })),
    });
  }

  const vsetky = dni.flatMap((d) => d.otvorene);
  return json({
    ok: true, od, krok, noShow,
    kalendare: kaly.map((x) => ({ poradie: x.poradie, nazov: x.cal.name || "Kalendár" })),
    zaciatok: vsetky.length ? hhmmZ(Math.min(...vsetky.map((h) => minutyZo(h.od)))) : "09:00",
    koniec: vsetky.length ? hhmmZ(Math.max(...vsetky.map((h) => minutyZo(h.do)))) : "17:00",
    dni,
  });
}

/* Zavrie čas: jedna blokácia Miriam ako používateľky, platí vo všetkých jej
   kalendároch. Jedno ťahanie = jedna blokácia, zruší sa jedným klikom. */
async function zavri(env, telo) {
  const datum = String(telo.datum || ""), odCas = String(telo.od || ""), doCas = String(telo.do || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum) || !/^\d{2}:\d{2}$/.test(odCas)
      || !/^\d{2}:\d{2}$/.test(doCas) || minutyZo(doCas) <= minutyZo(odCas)) {
    return json({ ok: false, error: "zlý čas" }, 400);
  }
  const kto = await pouzivatel(env);
  if (!kto) return json({ ok: false, error: "kalendár nemá priradenú osobu" }, 500);
  const r = await ghl(env, "/calendars/events/block-slots", {
    method: "POST", version: "2021-04-15",
    body: JSON.stringify({ assignedUserId: kto, locationId: env.GHL_LOCATION_ID,
      startTime: isoCas(datum, odCas), endTime: isoCas(datum, doCas), title: NAZOV_BLOKU }),
  });
  if (!r.ok) return json({ ok: false, error: "GHL neuložilo zatvorenie", detail: r.d }, 502);
  return json({ ok: true, id: (r.d || {}).id || "" });
}

/* Otvorí čas späť: zmaže blokáciu. */
async function otvor(env, telo) {
  const id = String(telo.id || "");
  if (!/^[A-Za-z0-9_-]{10,40}$/.test(id)) return json({ ok: false, error: "zlé id" }, 400);
  /* 🔴 Otvoriť smie len čas zavretý v konzole. Blokácie z GHL alebo Google kalendára
        (napr. „Deň architektúry") sú Miriamine vlastné, tie sa tu nemažú.
     🔴 `GET /calendars/events/{id}` s PIT nejde (401 „not yet supported by the IAM
        Service", overené 5. 10. 2026), preto sa blokácia hľadá v zozname dňa. */
  const datum = String(telo.datum || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) return json({ ok: false, error: "chýba dátum" }, 400);
  const kto = await pouzivatel(env);
  const zoznam = await ghl(env, `/calendars/blocked-slots?locationId=${env.GHL_LOCATION_ID}&userId=${kto}`
    + `&startTime=${Date.parse(isoCas(datum, "00:00"))}&endTime=${Date.parse(isoCas(datum, "23:59"))}`, { version: "2021-04-15" });
  if (!zoznam.ok) return json({ ok: false, error: "GHL nedalo zavretý čas" }, 502);
  const blok = (((zoznam.d || {}).events) || []).find((e) => e.id === id);
  if (!blok) return json({ ok: true, uzBolo: true });   // už je otvorené (druhý klik)
  if ((blok.title || "") !== NAZOV_BLOKU) {
    return json({ ok: false, error: "Tento čas nebol zavretý v konzole, otvorte ho tam, kde vznikol." }, 403);
  }
  const r = await ghl(env, `/calendars/events/${id}`, { method: "DELETE", version: "2021-04-15" });
  /* 🔴 Druhý klik (alebo dvojklik) maže už zmazanú blokáciu a GHL vráti 400
     „already been deleted" (overené 5. 10. 2026). Čas je otvorený, to je úspech. */
  if (!r.ok && /already been deleted/i.test(JSON.stringify(r.d || ""))) return json({ ok: true, uzBolo: true });
  if (!r.ok) return json({ ok: false, error: "GHL nezmazalo zatvorenie" }, 502);
  return json({ ok: true });
}

const CESTY = {
  "/api/konverzacie": (env, b) => konverzacie(env, b),
  "/api/vybavene": (env, b) => vybavene(env, b),
  "/api/sprava": (env, b) => sprava(env, b),
  "/api/odpovedz": (env, b) => odpovedz(env, b),
  "/api/prilezitosti": (env) => prilezitosti(env),
  "/api/presun": (env, b) => presun(env, b),
  "/api/prehlad": (env) => prehlad(env),
  "/api/lievik": (env, b) => lievik(env, b),
  "/api/ab": (env, b) => abTest(env, b),
  "/api/kalendar": (env, b) => kalendar(env, b),
  "/api/zavri": (env, b) => zavri(env, b),
  "/api/otvor": (env, b) => otvor(env, b),
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const fn = CESTY[url.pathname];
    if (!fn) return env.ASSETS.fetch(request);
    if (request.method !== "POST") return json({ ok: false, error: "len POST" }, 405);

    let telo = {};
    try { telo = await request.json(); } catch { telo = {}; }

    if (!env.GHL_API_KEY || !env.GHL_LOCATION_ID) {
      return json({ ok: false, error: "konzola nie je nastavená" }, 500);
    }
    if (!heslomOk(env, telo)) {
      return json({ ok: false, error: "nesedí heslo" }, 401);
    }
    // 🔴 Zámerne AŽ po hesle, aby chyba nastavenia nebola vidieť zvonku.
    if (!demoTag(env)) {
      return json({ ok: false, error: "konzola nemá nastavené, čo smie zobraziť" }, 500);
    }

    try {
      return await fn(env, telo);
    } catch (e) {
      return json({ ok: false, error: String(e && e.message || e) }, 500);
    }
  },
};

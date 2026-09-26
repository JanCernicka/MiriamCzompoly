/* Konzola Miriam Czompoly (projekt konzola-miriamczompoly).
 * Zdroj: šablóna Prezentacia/konzola/_worker.js (posledná zmena 24. 8. 2026, konzola
 * nasadená 26. 8.) + karta Lievik z konzola/worker-doplnok.js. Od 26. 9. 2026 je zdroj
 * TU, v repe klienta. Nasadenie: konzola/nasad.sh. Tajomstvá (GHL_API_KEY,
 * GHL_LOCATION_ID, DEMO_TAG, KONZOLA_HESLO, PIPELINE_ID, STAT_HESLO) sú v Cloudflare.
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

function maTag(tagy, tag) {
  return (tagy || []).some((x) => String(x).trim().toLowerCase() === tag);
}

/* ── konverzácie ──────────────────────────────────────────────────────── */

async function konverzacie(env) {
  const tag = demoTag(env);
  const r = await ghl(env, `/conversations/search?locationId=${env.GHL_LOCATION_ID}&limit=${STROP}`);
  if (!r.ok) return json({ ok: false, error: "GHL nedalo konverzácie" }, 502);

  const vsetky = (r.d.conversations || []);
  const moje = vsetky.filter((k) => maTag(k.tags, tag));

  return json({
    ok: true,
    konverzacie: moje.map((k) => ({
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

async function prilezitosti(env) {
  const tag = demoTag(env);
  const [p, o] = await Promise.all([
    ghl(env, `/opportunities/pipelines?locationId=${env.GHL_LOCATION_ID}`),
    ghl(env, `/opportunities/search?location_id=${env.GHL_LOCATION_ID}&limit=${STROP}`),
  ]);
  if (!p.ok) return json({ ok: false, error: "GHL nedalo pipeline" }, 502);
  if (!o.ok) return json({ ok: false, error: "GHL nedalo príležitosti" }, 502);

  // 🔴 Tu sa filtruje na tagoch VNORENÉHO kontaktu, ktoré /opportunities/search
  //    vracia rovno v odpovedi. Preto na to netreba ďalšie volanie na kontakt.
  const tagovane = ((o.d || {}).opportunities || [])
    .filter((x) => maTag((x.contact || {}).tags, tag));

  const pipeliny = (p.d || {}).pipelines || [];
  if (!pipeliny.length) return json({ ok: false, error: "v účte nie je žiadna pipeline" }, 404);
  const { pipeline, podla } = vyberPipeline(pipeliny, tagovane, env);

  const moje = tagovane.filter((x) => x.pipelineId === pipeline.id);

  return json({
    ok: true,
    pipeline: pipeline.name,
    vybrana_podla: podla,
    stage: (pipeline.stages || []).map((s) => ({ id: s.id, nazov: s.name })),
    karty: moje.map((x) => ({
      id: x.id, stageId: x.pipelineStageId,
      nazov: x.name || (x.contact || {}).name || "Bez názvu",
      firma: (x.contact || {}).companyName || "",
      tel: (x.contact || {}).phone || "",
      hodnota: x.monetaryValue || 0,
      zdroj: x.source || "",
      zmena: x.lastStageChangeAt || x.updatedAt || "",
    })),
  });
}

async function presun(env, telo) {
  const tag = demoTag(env);
  const id = String(telo.id || "");
  const stageId = String(telo.stageId || "");
  if (!id || !stageId) return json({ ok: false, error: "chýba karta alebo stĺpec" }, 400);

  const o = await ghl(env, `/opportunities/${id}`);
  if (!o.ok) return json({ ok: false, error: "príležitosť sa nenašla" }, 404);
  const p = (o.d || {}).opportunity || {};
  if (!maTag((p.contact || {}).tags, tag)) {
    return json({ ok: false, error: "táto karta sem nepatrí" }, 403);
  }

  // 🔴 PUT chce pipelineId AJ pipelineStageId. Bez pipelineId to GHL odmietne
  //    a karta ostane, kde bola, hoci UI ju už presunulo.
  const r = await ghl(env, `/opportunities/${id}`, {
    method: "PUT",
    body: JSON.stringify({ pipelineId: p.pipelineId, pipelineStageId: stageId }),
  });
  if (!r.ok) return json({ ok: false, error: "presun sa neuložil", detail: r.d }, 502);

  // 🔴 200 nie je dôkaz, prečítaj späť. Frontend podľa toho vráti kartu
  //    naspäť, keď sa presun neujal.
  const spat = await ghl(env, `/opportunities/${id}`);
  const teraz = ((spat.d || {}).opportunity || {}).pipelineStageId;
  return json({ ok: teraz === stageId, stageId: teraz });
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
  /* { id: "diagnostika-ab", nazov: "diagnostika, A/B test (od …)", od: Date.UTC(…), ab: true }, */
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


const CESTY = {
  "/api/konverzacie": (env) => konverzacie(env),
  "/api/sprava": (env, b) => sprava(env, b),
  "/api/odpovedz": (env, b) => odpovedz(env, b),
  "/api/prilezitosti": (env) => prilezitosti(env),
  "/api/presun": (env, b) => presun(env, b),
  "/api/prehlad": (env) => prehlad(env),
  "/api/lievik": (env, b) => lievik(env, b),
  "/api/ab": (env, b) => abTest(env, b),
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

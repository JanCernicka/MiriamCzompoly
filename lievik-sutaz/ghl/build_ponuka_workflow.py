#!/usr/bin/env python3
"""Workflow „Súťaž: diagnostika -50 %, 72 h“ pre Miriam.

Spúšťa ho prihlásenie do súťaže (tag sutaz-1000-prihlasena, pridá ho
functions/api/sutaz.js po tretej otázke). Lehota je teda individuálna,
beží od chvíle, keď ona vyplnila formulár, nie od spustenia reklamy.

    SMS + e-mail „máš 72 hodín“        hneď
    čakaj 48 hodín
    SMS + e-mail „zostáva 24 hodín“

Kto si medzitým termín zarezervuje, z workflowu ho vyhodí
functions/api/sutaz-termin.js (DELETE /contacts/{id}/workflow/{wf}),
treba mu dať ID tohto workflowu do premennej PONUKA_WF_ID v Cloudflare.

Workflow vznikne ako DRAFT. Publikuje sa až na výslovný pokyn.

Použitie (potrebuje GHLtool a internú API):
    GHL_LOCATION_ID=... GHL_FIREBASE_REFRESH_TOKEN=... \\
        python3 ghl/build_ponuka_workflow.py            # len ukáže, čo by spravil
        python3 ghl/build_ponuka_workflow.py --naostro  # vytvorí šablóny a workflow
"""
import os
import sys
import uuid

GHLTOOL = os.environ.get("GHLTOOL", "/home/user/GHLtool")
sys.path.insert(0, GHLTOOL)

# odkaz na stránku s ponukou; po presune na doménu Miriam prepísať a spustiť znova
PONUKA_URL = "https://miriam-sutaz.pages.dev/dakujem"
TAG_SPUSTAC = "sutaz-1000-prihlasena"
NAZOV = "Súťaž: diagnostika -50 %, 72 h (Claude)"

# SMS: bez diakritiky a bez mena. Jedno „á“ v mene (Mária) by prepísalo celú SMS
# do UCS-2 a zo 160 znakov by bolo 70, čiže 2 až 3 segmenty.
SMS_72 = f"Ahoj, mas 72 hodin na diagnostiku u teba doma za 124,50 eur namiesto 249. Termin si vyber tu: {PONUKA_URL.replace('https://', '')} Miriam"
SMS_24 = f"Ahoj, uz len 24 hodin mas diagnostiku za 124,50 eur namiesto 249. Potom sa ponuka zavrie. Termin: {PONUKA_URL.replace('https://', '')} Miriam"

EMAIL_72_PREDMET = "Máš 72 hodín: diagnostika u teba doma za polovicu"
EMAIL_72 = [
    "Ahoj {{contact.first_name}},",
    "ďakujem, že si sa zapojila do súťaže o 1 000 € na premenu domova. Výhercu vyhlásim vo štvrtok 15. októbra o 18:00, výherca dostane SMS a e-mail.",
    "Kým čakáš, mám pre teba ponuku, ktorú nemám nikde inde: <b>interiérovú diagnostiku u teba doma za 124,50 € namiesto 249 €</b>. Platí 72 hodín od chvíle, keď si sa zapojila.",
    "Za 90 minút u teba doma budeš vedieť, čo zmeniť ako prvé a čo prestať kupovať.",
]
EMAIL_24_PREDMET = "Zostáva 24 hodín: diagnostika za polovicu"
EMAIL_24 = [
    "Ahoj {{contact.first_name}},",
    "pripomínam, že ponuka na <b>diagnostiku u teba doma za 124,50 € namiesto 249 €</b> sa ti o 24 hodín zavrie.",
    "Ak z našich 90 minút neodídeš s jasnom, čo ďalej, povedz mi to na mieste a diagnostiku ti nefakturujem.",
]
PODPIS = "Miriam Czompoly<br>interiérová dizajnérka, Trnava"
TLACIDLO = "Vybrať si termín"

GSM7 = set("@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡"
           "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà")


def kontrola_sms():
    chyby = []
    for nazov, t in (("SMS 72 h", SMS_72), ("SMS 24 h", SMS_24)):
        zle = sorted({c for c in t if c not in GSM7})
        if zle:
            chyby.append(f"{nazov}: znaky mimo GSM-7 {zle}")
        if len(t) > 160:
            chyby.append(f"{nazov}: {len(t)} znakov, viac ako 1 segment")
    return chyby


def _uid():
    return str(uuid.uuid4())


def okno():
    # `always` GHL už neberie a za behu potichu zabije workflow (cookbook §5)
    return {"condition": "when", "days": [0, 1, 2, 3, 4, 5, 6], "start": "00:00", "end": "23:59"}


def krok_sms(meno, text):
    return {"id": _uid(), "type": "sms", "name": meno, "attributes": {"body": text, "attachments": []}}


def krok_email(meno, predmet, template_id):
    return {"id": _uid(), "type": "email", "name": meno, "attributes": {
        "subject": predmet,
        "template_id": template_id,
        "templatesource": "email-builder",
        "templateCreationMode": "existing",
        "from_name": "Miriam Czompoly",
        "from_email": "{{location.email}}",
        "trackingOptions": {"hasTrackingLinks": True, "hasUtmTracking": False, "hasTags": False},
        "conditions": [], "preHeader": "", "attachments": [],
    }}


def krok_cakaj(meno, hodiny):
    return {"id": _uid(), "type": "wait", "name": meno, "attributes": {
        "type": "time",
        "startAfter": {"type": "hours", "value": hodiny, "when": "after"},
        "window": okno(),
        "windowCondition": {"field": "", "operator": "", "value": ""},
        "name": meno, "cat": "", "isHybridAction": True, "hybridActionType": "wait", "transitions": [],
    }}


def pospajaj(kroky):
    for i, k in enumerate(kroky):
        k["order"] = i
        k["parentKey"] = kroky[i - 1]["id"] if i else None
        k["next"] = kroky[i + 1]["id"] if i + 1 < len(kroky) else None
        k["advanceCanvasMeta"] = {"position": {"x": 400, "y": i * 160}}
        k.setdefault("cat", "")
    return kroky


def navrh_emailu(odstavce):
    from cli_anything.gohighlevel.utils.email_builder import EmailDesign
    d = EmailDesign(body_bg="#FFFFFF", button_bg="#262019", button_radius="10")
    prvky = [d.text(f"<p>{t}</p>") for t in odstavce]
    prvky.append(d.button(TLACIDLO, PONUKA_URL, bg="#262019"))
    prvky.append(d.text(f"<p>{PODPIS}</p>"))
    d.section(prvky)
    return d


def main():
    naostro = "--naostro" in sys.argv
    chyby = kontrola_sms()
    print(f"SMS 72 h ({len(SMS_72)} zn.): {SMS_72}")
    print(f"SMS 24 h ({len(SMS_24)} zn.): {SMS_24}")
    if chyby:
        print("CHYBA:", *chyby, sep="\n  ")
        sys.exit(1)

    kroky = pospajaj([
        krok_sms("SMS: máš 72 hodín", SMS_72),
        krok_email("E-mail: máš 72 hodín", EMAIL_72_PREDMET, "<sablona-72>"),
        krok_cakaj("Čakaj 48 hodín", 48),
        krok_sms("SMS: zostáva 24 hodín", SMS_24),
        krok_email("E-mail: zostáva 24 hodín", EMAIL_24_PREDMET, "<sablona-24>"),
    ])
    from cli_anything.gohighlevel.utils import workflow_ops as wo
    problemy = wo.validate_graph(kroky)
    print(f"Graf: {len(kroky)} krokov, problémy: {problemy or 'žiadne'}")
    for k in kroky:
        print(f"  {k['order']}. {k['type']:6} {k['name']}")
    if problemy:
        sys.exit(1)
    if not naostro:
        print("\nNič som nevytvoril. Naostro: --naostro")
        return

    loc = os.environ["GHL_LOCATION_ID"]  # zámerne bez defaultu, nech sa nepíše do cudzieho účtu
    from cli_anything.gohighlevel.utils.ghl_internal_client import InternalGHLClient, TokenManager
    from cli_anything.gohighlevel.utils.email_builder import EmailBuilder
    c = InternalGHLClient(TokenManager(), loc)
    eb = EmailBuilder(c)

    # šablóny PRED workflowom, inak sa e-mail v editore nenačíta (cookbook §2)
    t72 = eb.create_and_save("Súťaž: máš 72 hodín (Claude)", navrh_emailu(EMAIL_72), EMAIL_72_PREDMET)
    t24 = eb.create_and_save("Súťaž: zostáva 24 hodín (Claude)", navrh_emailu(EMAIL_24), EMAIL_24_PREDMET)
    if not t72 or not t24:
        sys.exit(f"Šablóny sa nevytvorili: {t72} {t24}")
    kroky[1]["attributes"]["template_id"] = t72
    kroky[4]["attributes"]["template_id"] = t24

    res = wo.create_workflow(c, NAZOV, kroky, trigger_body=wo.tag_trigger("", loc, TAG_SPUSTAC))
    print("Výsledok:", res)
    if not res.get("steps_ok"):
        sys.exit("Kroky sa neuložili, pozri výsledok vyššie.")

    # prečítať späť: 200 OK nie je dôkaz
    wf = wo.read_workflow(c, res["id"])
    tpl = wf.get("workflowData", {}).get("templates", [])
    sms_ok = all(s["attributes"].get("body") for s in tpl if s.get("type") == "sms")
    trg = wo.read_triggers(c, res["id"])
    print(f"Späť prečítané: {len(tpl)} krokov, SMS majú text: {sms_ok}, triggerov: {len(trg)}, stav: {wf.get('status')}")
    print(f"\nID workflowu pre Cloudflare (PONUKA_WF_ID): {res['id']}")


if __name__ == "__main__":
    main()

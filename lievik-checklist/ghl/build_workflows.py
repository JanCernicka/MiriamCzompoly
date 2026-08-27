"""Postaví lievik na checklist v GHL: tagy, dve e-mailové šablóny, dva workflowy.

Spustenie (potrebuje .env s GHL_API_KEY, GHL_LOCATION_ID, GHL_FIREBASE_REFRESH_TOKEN):

    python3 ghl/build_workflows.py --dry-run    # nič nezapíše, len vypíše plán
    python3 ghl/build_workflows.py              # vytvorí, workflowy ostanú DRAFT

Reťaz:
    stránka -> Cloudflare Function -> kontakt + tagy -> tag spúšťa workflow

    tag `checklist-developer`   -> WF-A, pošle checklist hneď
    tag `preberam-do-3m`        -> WF-B, o 3 dni ponuka platenej služby

Zámerne dva workflowy s dvoma tagmi namiesto jedného s vetvením. `if_else` je
krehké a segment „do 3 mesiacov" je aj tak samostatný tag z formulára.

🔴 Meno kontaktu nezbierame, formulár pýta iba e-mail. V textoch preto NESMIE byť
   `{{contact.first_name}}`, vyrenderovalo by sa ako „Ahoj ,".
"""
from __future__ import annotations

import os
import sys
import time

sys.path.insert(0, "/home/user/GHLtool")
from cli_anything.gohighlevel.utils.ghl_internal_client import InternalGHLClient, TokenManager
from cli_anything.gohighlevel.utils.email_builder import EmailBuilder, EmailDesign
from cli_anything.gohighlevel.utils import workflow_ops as wo
from cli_anything.gohighlevel.utils.ghl_client import get, post

# 🔴 po nasadení na ostrú doménu treba prepísať aj tu
BASE = os.environ.get("CHECKLIST_BASE", "https://miriam-checklist.pages.dev")
PDF = f"{BASE}/assets/checklist-preberanie-bytu.pdf"

TAGS = ["checklist-developer", "preberam-do-3m", "preberam-do-roka",
        "preberam-neviem", "uz-byvam"]

INK, PAPER, BRASS = "#262019", "#FAF6EF", "#A9885E"
SANS = "'Inter', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"

P = f'style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:{INK};font-family:{SANS}"'


def design_email_1() -> EmailDesign:
    d = EmailDesign(body_bg=PAPER, button_bg=INK, button_radius="50", body_font=SANS)
    d.section([
        d.text(f'<p {P}>Ahoj,</p>'
               f'<p {P}>posielam checklist, ktorý si si pýtala. Je rozdelený podľa toho, '
               f'<b>kedy</b> sa daná vec musí riešiť, lebo väčšina z neho sa pri samotnom '
               f'preberaní už zachrániť nedá.</p>'),
        d.button("Otvoriť checklist", PDF, bg=INK, radius="50"),
        d.text(f'<p {P}>Som Miriam, interiérová dizajnérka z Trnavy. Od roku 2010 navrhujem '
               f'interiéry a s klientkami chodím na obhliadky ešte pred preberaním, lebo '
               f'práve tam sa dá ušetriť najviac peňazí.</p>'
               f'<p {P}>Ak by ti niečo nebolo jasné, stačí odpísať na tento e-mail. '
               f'Čítam každú správu.</p>'
               f'<p {P}>Miriam</p>'),
    ], bg=PAPER)
    return d


def design_email_2() -> EmailDesign:
    d = EmailDesign(body_bg=PAPER, button_bg=INK, button_radius="50", body_font=SANS)
    d.section([
        d.text(f'<p {P}>Ahoj,</p>'
               f'<p {P}>písala si, že byt preberáš do troch mesiacov. To znamená, že '
               f'uzávierka klientských zmien je buď tesne pred tebou, alebo už prešla. '
               f'Je to ten najdrahší moment na to, aby si niečo prehliadla.</p>'
               f'<p {P}>Ponúkam ti, že tvoje podklady od developera prejdeme spolu. '
               f'Pozrieme sa na pôdorys, výkres elektriky a rozvinuté steny, pomenujem, '
               f'čo v nich chýba, a pripravím ti <b>zoznam zmien, ktoré má zmysel žiadať</b>, '
               f'vrátane toho, čo si necháš nenamontovať.</p>'
               f'<p {P}>Je to platená služba a má to jednoduchý dôvod: ušetrí ti násobne '
               f'viac, než stojí.</p>'
               f'<p {P}>Ak ťa to zaujíma, odpíš na tento e-mail a pošlem ti podrobnosti '
               f'aj cenu.</p>'
               f'<p {P}>Miriam</p>'),
    ], bg=PAPER)
    return d


def ensure_tags(loc: str) -> None:
    """Tag, ktorý neexistuje, sa v kroku uloží, ale UI naň hlási chybu."""
    existing = {t.get("name", "").lower()
                for t in (get(f"/locations/{loc}/tags") or {}).get("tags", [])}
    for t in TAGS:
        if t.lower() in existing:
            print(f"   tag už je: {t}")
            continue
        post(f"/locations/{loc}/tags", {"name": t})
        print(f"   tag vytvorený: {t}")


def wait_step(sid: str, nxt: str | None, value: int, unit: str, label: str) -> dict:
    return {
        "id": sid, "type": "wait", "name": label,
        "attributes": {
            "type": "time",
            "startAfter": {"type": unit, "value": value, "when": "after"},
            # 🔴 `always` GHL už neberie a workflow s ním potichu zomrie na čakaní
            "window": {"condition": "when", "days": [0, 1, 2, 3, 4, 5, 6],
                       "start": "00:00", "end": "23:59"},
            "windowCondition": {"field": "", "operator": "", "value": ""},
            "name": label, "cat": "", "isHybridAction": True,
            "hybridActionType": "wait", "transitions": [],
        },
        "order": 0, "parentKey": None, "next": nxt,
        "advanceCanvasMeta": {"position": {"x": 400, "y": 0}}, "cat": "",
    }


def email_step(sid: str, nxt: str | None, subject: str, template_id: str, label: str) -> dict:
    return {
        "id": sid, "type": "email", "name": label,
        "attributes": {
            "subject": subject,
            "template_id": template_id,          # 🔴 bez toho sa e-mail v editore nenačíta
            "templatesource": "email-builder",
            "templateCreationMode": "existing",
            "from_name": "Miriam Czompoly",      # snake_case rozhoduje
            "from_email": "{{location.email}}",
            "trackingOptions": {"hasTrackingLinks": True, "hasUtmTracking": False,
                                "hasTags": False},
            "conditions": [], "preHeader": "", "attachments": [],
        },
        "order": 0, "parentKey": None, "next": nxt,
        "advanceCanvasMeta": {"position": {"x": 400, "y": 0}}, "cat": "",
    }


def link(steps: list[dict]) -> list[dict]:
    """Doplní poradie, next a parentKey. Bez parentKey sa graf v editore nevykreslí."""
    for i, s in enumerate(steps):
        s["order"] = i
        s["next"] = steps[i + 1]["id"] if i + 1 < len(steps) else None
        s["parentKey"] = steps[i - 1]["id"] if i else None
        s["advanceCanvasMeta"] = {"position": {"x": 400, "y": i * 150}}
    return steps


def main() -> None:
    dry = "--dry-run" in sys.argv
    loc = os.environ["GHL_LOCATION_ID"]

    print("1. tagy")
    if dry:
        print("   (dry-run) vytvoril by som:", ", ".join(TAGS))
    else:
        ensure_tags(loc)

    c = InternalGHLClient(TokenManager(), loc)
    eb = EmailBuilder(c)

    print("2. e-mailové šablóny")
    if dry:
        t1 = t2 = "DRY"
    else:
        t1 = eb.create_and_save("Checklist: dodanie", design_email_1(),
                                subject_line="Tu je tvoj checklist")
        t2 = eb.create_and_save("Checklist: ponuka na prejdenie výkresov", design_email_2(),
                                subject_line="Prejdem s tebou tvoje výkresy")
        print(f"   šablóna 1: {t1}\n   šablóna 2: {t2}")
        if not (t1 and t2):
            raise SystemExit("🔴 šablóna sa nevytvorila, workflowy nestavaj")

    print("3. workflowy")
    uid = wo.uuid.uuid4
    wf_a = link([
        email_step(str(uid()), None, "Tu je tvoj checklist", t1, "E-mail: checklist"),
    ])
    wf_b = link([
        wait_step(str(uid()), None, 3, "days", "Čakaj 3 dni"),
        email_step(str(uid()), None, "Prejdem s tebou tvoje výkresy", t2,
                   "E-mail: ponuka prejdenia výkresov"),
    ])

    for name, steps, tag in [
        ("Checklist: dodanie (IG lievik)", wf_a, "checklist-developer"),
        ("Checklist: ponuka pre preberajúcich do 3 mesiacov", wf_b, "preberam-do-3m"),
    ]:
        problems = wo.validate_graph(steps)
        if problems:
            raise SystemExit(f"🔴 {name}: {problems}")
        if dry:
            print(f"   (dry-run) {name}: {len(steps)} krokov, spúšťač tag `{tag}`")
            continue
        r = wo.create_workflow(c, name, steps, wo.tag_trigger("", loc, tag))
        print(f"   {name}: id={r.get('id')} steps_ok={r.get('steps_ok')}")

    if dry:
        print("\nDRY RUN, nič sa nezapísalo.")
        return

    print("\n4. kontrola spätným čítaním")
    time.sleep(3)
    for w in c.request("GET", f"/workflow/{loc}", version="2021-04-15"):
        if w.get("name", "").startswith("Checklist:"):
            trs = wo.read_triggers(c, w["id"]) or []
            steps = wo.read_workflow(c, w["id"])["workflowData"]["templates"]
            print(f"   {w['name']}: {len(steps)} krokov, status={w.get('status')}, "
                  f"triggerov={len(trs)}, aktívny={[t.get('active') for t in trs]}")

    print("\n🔴 Workflowy sú DRAFT. Kým sa nepublikujú, neodíde ani jeden e-mail.")


if __name__ == "__main__":
    main()

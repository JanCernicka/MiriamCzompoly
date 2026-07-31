"""Prebrandovanie GHL formulara "5 chyb" do vizualu webu Miriam Czompoly.

Formular sedi v iframe, takze CSS zo stranky sa don nedostane. Styling sa musi
prepisat priamo vo formulari cez internal API.

Dve veci, ktore stali najviac casu (viz principles/general-principles-website.md):

1. `customStyle` je plnohodnotne CSS. GHL ho zabali do `#_builder-form { ... }`
   a vie aj vnorene selektory (`.form-control` -> `#_builder-form .form-control`).
   ALE `@import` skonci vnutri toho bloku, kde je neplatny, takze vlastne fonty
   sa takto nacitat NEDAJU. Preto su vsade uvedene fallbacky.

2. Fonty si GHL taha sam, ale len z **struktúrovanych** poli (`fontFamily`,
   `labelFontFamily`, ...). Font schovany v inline HTML nadpisu neuvidi a
   stranka spadne na fallback. Preto sa font nastavuje na oboch miestach.
"""
import json, os, sys
sys.path.insert(0, "/home/user/GHLtool")
from cli_anything.gohighlevel.utils.ghl_internal_client import InternalGHLClient, TokenManager
from cli_anything.gohighlevel.utils.form_builder import FormBuilder

FORM_ID = "geA4rea6TYWIKcskupXQ"

# paleta a pisma webu (assets/css/style.css)
INK, INK_SOFT, MUTED = "262019", "4C453B", "857B6C"
LINE_2, BRASS, PLACEHOLDER = "D8CBB4", "A9885E", "B3A892"
SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"
SANS = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

CUSTOM_CSS = f"""
/* --- pismo ---------------------------------------------------------- */
.text-element, .heading-element, .heading-element h1, .heading-element h2 {{
  font-family: {SERIF} !important;
}}
/* Obal .text-element ma vlastnych 40px a line-height 1.2, takze riadkovy box
   ostane 48px aj ked je nadpis mensi. Pri zalomeni to spravi obrovsku medzeru. */
.text-element {{
  font-size: 28px !important;
  line-height: 1.2 !important;
}}
label.label-alignment, .form-control, button.button-element,
button.button-element * {{
  font-family: {SANS} !important;
}}

/* --- label: rovnaky ako .form label na webe -------------------------- */
label.label-alignment {{
  font-size: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  color: #{MUTED} !important;
  margin-bottom: 6px !important;
}}

/* --- pole: rovnake ako .form .field na webe -------------------------- */
.form-control {{
  background: #FFFFFF !important;
  border: 1px solid #{LINE_2} !important;
  border-radius: 6px !important;
  color: #{INK} !important;
  font-size: 16px !important;
  height: 54px !important;
  box-shadow: none !important;
  transition: border-color .3s ease, box-shadow .3s ease !important;
}}
.form-control::placeholder {{ color: #{PLACEHOLDER} !important; opacity: 1 !important; }}
.form-control:focus {{
  border-color: #{BRASS} !important;
  box-shadow: 0 0 0 3px rgba(169,136,94,.16) !important;
  outline: none !important;
}}

/* --- tlacidlo: letter-spacing ako .btn na webe ----------------------- */
button.button-element {{
  font-weight: 600 !important;
  letter-spacing: 0.06em !important;
}}

/* --- rozostupy: karta .optin-card uz padding ma ---------------------- */
.form-builder--btn-submit {{ margin-top: 18px !important; }}
/* posledny prvok si nesie margin-bottom, ktory sa scita s paddingom karty */
.form-field-wrapper:last-child {{ margin-bottom: 0 !important; }}
"""


def main() -> None:
    c = InternalGHLClient(TokenManager(), os.environ["GHL_LOCATION_ID"])
    fb = FormBuilder(c)
    form = fb.read_form(FORM_ID)["form"]
    fd = form["formData"]
    frm = fd["form"]
    before = len(frm["fields"])

    frm["customStyle"] = CUSTOM_CSS.strip()

    # plocha formulara: obal na stranke ma vlastny padding, nesmie sa scitavat
    for key in ("padding", "mobilePadding"):
        frm["style"][key] = {"top": 0, "bottom": 0, "left": 0, "right": 0,
                             "extraPaddingComputingProcessed": True}
    frm["style"]["fieldSpacing"] = 18

    # struktúrované font polia, z tychto si GHL sklada Google Fonts URL
    fs = frm["fieldStyle"]
    fs["border"] = {"border": 1, "color": LINE_2 + "FF", "radius": 6, "type": "solid"}
    fs["bgColor"] = "FFFFFF"
    fs["fontColor"] = INK + "FF"
    fs["labelColor"] = MUTED + "FF"
    fs["labelFontFamily"] = "Inter"
    fs["labelFontSize"] = 12
    fs["labelFontWeight"] = "600"
    fs["mobileLabelColor"] = MUTED + "FF"
    fs["mobileLabelFontFamily"] = "Inter"
    fs["mobilePlaceholderFontFamily"] = "Inter"
    fs["placeholderColor"] = PLACEHOLDER + "FF"
    fs["placeholderFontFamily"] = "Inter"
    fs["placeholderFontSize"] = 16
    fs["placeholderFontWeight"] = 400
    fs["padding"] = {"top": 14, "bottom": 14, "left": 14, "right": 14}
    fs["shortLabel"].update({"fontFamily": "Inter", "color": INK_SOFT + "FF",
                             "mobileFontFamily": "Inter", "fontSize": 12})

    for f in frm["fields"]:
        if f.get("tag") == "header":
            # Stranka nad formularom uz nesie cely slub (H1 + odrazky), preto
            # tu staci mikro-otazka. Vaha 400: Cormorant sa nacita v 400/700 a
            # 700 (ani Georgia bold) sa k lahkemu nadpisu na webe nepodoba.
            f["fontFamily"] = "Cormorant Garamond"
            f["color"] = "#" + INK
            f["label"] = (
                '<h1 style="margin:0;color:#%s;font-weight:400;line-height:1.15;'
                'font-family:%s;"><span style="font-size:28px;">'
                "Kam ti ho mám poslať?"
                "</span></h1>" % (INK, SERIF)
            )
            f["placeholder"] = "Kam ti ho mám poslať?"
        elif f.get("tag") == "submit":
            # default padding 60px po stranach tlacil napis do troch riadkov
            f["padding"] = {"top": 18, "bottom": 18, "left": 24, "right": 24}
            f["radius"] = 50
            f["bgColor"] = INK + "FF"
            f["color"] = "FFFFFF"
            f["fontFamily"] = "Inter"
            f["fontSize"] = 15
            f["label"] = (
                '<p style="text-align:center;line-height:1.3;margin:0;"><strong>'
                '<span style="font-size:15px;letter-spacing:0.06em;">'
                "Poslať mi to zdarma</span></strong></p>"
            )

    frm["formAction"]["thankyouText"] = (
        '<p style="text-align:center;">E-book je na ceste. Pozri si schránku, '
        "vrátane priečinka Promo alebo Spam.</p>"
    )
    frm["submitMessageStyle"].update({"fontFamily": "Inter", "color": INK, "fontSize": 16})

    if "--dry-run" in sys.argv:
        print("DRY RUN, neukladam."); return

    fb.update_form(FORM_ID, form["name"], fd)

    again = fb.read_form(FORM_ID)["form"]["formData"]["form"]
    assert len(again["fields"]) == before, "POZOR: formular stratil polia"
    print("polia:", len(again["fields"]))
    print("customStyle:", len(again["customStyle"]), "znakov")
    print("padding:", again["style"]["mobilePadding"])


if __name__ == "__main__":
    main()

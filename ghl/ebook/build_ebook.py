#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generuje lead magnet PDF „5 najdrahších chýb, ktoré ľudia robia pri zariaďovaní domova".

Tón a štruktúra sú odvodené z jej vlastných e-bookov (Tajomstvá ideálnej spálne,
Sprievodca teóriou farieb, 6 tipov ako oživiť svoj interiér): tykanie, prvá osoba,
konkrétne čísla, priamo k veci, na konci mäkké CTA.

Obsah chýb je zosúladený s copy, ktorá je už schválená a nasadená:
  - step6d E2 („nábytok polepený o steny a miestnosť nemá centrum" = chyba č. 2)
  - step6d E3 („koberec sem, lampa tam, doplnky z akcie")
  - reklama R2 („zlé rozloženie, zablokovaný vstup, nábytok pri stenách, miestnosť bez centra")

Spustenie:  python3 client-miriam/ebook/build_ebook.py
Výstup:     client-miriam/ebook/5-najdrahsich-chyb.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, PageBreak, Table, TableStyle, NextPageTemplate)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "5-najdrahsich-chyb.pdf")

# --- brand (podľa jej loga: zlatá na čiernej) ---
INK   = colors.HexColor("#211C17")
GOLD  = colors.HexColor("#B08D४6".replace("४", "4"))
GOLD  = colors.HexColor("#B08D46")
PAPER = colors.HexColor("#FAF6EF")
MUTED = colors.HexColor("#6E6357")

D = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("Body", f"{D}/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Body-B", f"{D}/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Disp", f"{D}/DejaVuSerif.ttf"))
pdfmetrics.registerFont(TTFont("Disp-B", f"{D}/DejaVuSerif-Bold.ttf"))

# DejaVuSans nemá kurzívu -> beriem Liberation Sans (metricky blízka) a registrujem
# rodinu, aby <i> a <b> vnútri Paragraph fungovali.
LIB = "/usr/share/fonts/truetype/liberation"
pdfmetrics.registerFont(TTFont("Body-I", f"{LIB}/LiberationSans-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Body-BI", f"{LIB}/LiberationSans-BoldItalic.ttf"))
pdfmetrics.registerFontFamily("Body", normal="Body", bold="Body-B",
                              italic="Body-I", boldItalic="Body-BI")

S = {
 "h1":    ParagraphStyle("h1", fontName="Disp-B", fontSize=30, leading=36, textColor=PAPER, alignment=TA_CENTER),
 "sub":   ParagraphStyle("sub", fontName="Body", fontSize=12, leading=18, textColor=GOLD, alignment=TA_CENTER),
 "eyeb":  ParagraphStyle("eyeb", fontName="Body-B", fontSize=8.5, leading=12, textColor=GOLD, alignment=TA_CENTER),
 "num":   ParagraphStyle("num", fontName="Disp-B", fontSize=44, leading=46, textColor=GOLD),
 "h2":    ParagraphStyle("h2", fontName="Disp-B", fontSize=19, leading=24, textColor=INK, spaceAfter=6),
 "lead":  ParagraphStyle("lead", fontName="Body", fontSize=11.5, leading=18, textColor=INK, spaceAfter=9),
 "p":     ParagraphStyle("p", fontName="Body", fontSize=10.5, leading=16.5, textColor=INK, spaceAfter=8),
 "label": ParagraphStyle("label", fontName="Body-B", fontSize=9, leading=12, textColor=GOLD, spaceAfter=3),
 "box":   ParagraphStyle("box", fontName="Body", fontSize=10, leading=15.5, textColor=INK),
 "boxb":  ParagraphStyle("boxb", fontName="Body-B", fontSize=10, leading=15.5, textColor=INK),
 "cta":   ParagraphStyle("cta", fontName="Body", fontSize=11, leading=17, textColor=PAPER),
 "ctah":  ParagraphStyle("ctah", fontName="Disp-B", fontSize=24, leading=29, textColor=PAPER),
 "small": ParagraphStyle("small", fontName="Body", fontSize=8.5, leading=12, textColor=MUTED),
}


def cover(c, doc):
    c.saveState()
    c.setFillColor(INK); c.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    c.setStrokeColor(GOLD); c.setLineWidth(0.7)
    c.rect(14*mm, 14*mm, A4[0]-28*mm, A4[1]-28*mm, fill=0, stroke=1)
    c.setFillColor(GOLD); c.setFont("Body", 8)
    c.drawCentredString(A4[0]/2, 20*mm, "WWW.MIRIAMCZOMPOLY.SK")
    c.restoreState()


def inner(c, doc):
    c.saveState()
    c.setFillColor(PAPER); c.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    c.setStrokeColor(GOLD); c.setLineWidth(0.6)
    c.line(20*mm, 16*mm, A4[0]-20*mm, 16*mm)
    c.setFillColor(MUTED); c.setFont("Body", 7.5)
    c.drawString(20*mm, 11*mm, "MIRIAM CZOMPOLY · INTERIÉROVÁ DIZAJNÉRKA · TRNAVA")
    c.drawRightString(A4[0]-20*mm, 11*mm, str(doc.page - 1))
    c.restoreState()


def closing(c, doc):
    c.saveState()
    c.setFillColor(INK); c.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    c.setStrokeColor(GOLD); c.setLineWidth(0.7)
    c.rect(14*mm, 14*mm, A4[0]-28*mm, A4[1]-28*mm, fill=0, stroke=1)
    c.setFillColor(GOLD); c.setFont("Body", 8)
    c.drawCentredString(A4[0]/2, 20*mm, "WWW.MIRIAMCZOMPOLY.SK")
    c.restoreState()


def tipbox(text_html):
    p = Paragraph(text_html, S["box"])
    t = Table([[p]], colWidths=[165*mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0E8DA")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return t


def mistake(n, title, body_paras, costs, fix_html):
    """Jedna chyba = číslo + nadpis + text + 'Koľko ťa to stojí' + 'Čo s tým'."""
    flow = []
    head = Table(
        [[Paragraph(str(n), S["num"]), Paragraph(title, S["h2"])]],
        colWidths=[20*mm, 145*mm]
    )
    head.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (1, 0), (1, 0), 8),
    ]))
    flow.append(head)
    flow.append(Spacer(1, 3))
    for para in body_paras:
        flow.append(Paragraph(para, S["p"]))
    flow.append(Spacer(1, 2))
    flow.append(Paragraph("KOĽKO ŤA TO STOJÍ", S["label"]))
    flow.append(Paragraph(costs, S["p"]))
    flow.append(Spacer(1, 4))
    flow.append(tipbox(f'<font face="Body-B" color="#B08D46">ČO S TÝM →</font> {fix_html}'))
    return flow


def build():
    doc = BaseDocTemplate(OUT, pagesize=A4,
                          title="5 najdrahších chýb, ktoré ľudia robia pri zariaďovaní domova",
                          author="Miriam Czompoly", subject="Interiérový dizajn",
                          leftMargin=22*mm, rightMargin=22*mm, topMargin=24*mm, bottomMargin=22*mm)
    fr = Frame(22*mm, 22*mm, A4[0]-44*mm, A4[1]-46*mm, id="f")
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[Frame(24*mm, 40*mm, A4[0]-48*mm, A4[1]-110*mm, id="c")], onPage=cover),
        PageTemplate(id="inner", frames=[fr], onPage=inner),
        PageTemplate(id="closing", frames=[Frame(26*mm, 40*mm, A4[0]-52*mm, A4[1]-90*mm, id="cl")], onPage=closing),
    ])

    st = []

    # ---------- OBÁLKA ----------
    st.append(Spacer(1, 78*mm))
    st.append(Paragraph("INTERIÉROVÁ DIZAJNÉRKA · TRNAVA", S["eyeb"]))
    st.append(Spacer(1, 12))
    st.append(Paragraph("5 najdrahších chýb,<br/>ktoré ľudia robia<br/>pri zariaďovaní domova", S["h1"]))
    st.append(Spacer(1, 16))
    st.append(Paragraph("A ako sa im vyhnúť ešte predtým,<br/>než minieš prvé euro", S["sub"]))
    st.append(Spacer(1, 30))
    st.append(Paragraph("Miriam Czompoly", S["sub"]))

    # ---------- ÚVOD ----------
    st.append(NextPageTemplate("inner"))
    st.append(PageBreak())
    st.append(Paragraph("Kým začneš čítať", S["h2"]))
    st.append(Spacer(1, 6))
    st.append(Paragraph(
        "Od roku 2010 chodím ľuďom do domácností. A poviem ti rovno: "
        "<b>9 z 10 domácností má tie isté chyby.</b> Nie preto, že by tam bývali nešikovní ľudia. "
        "Ale preto, že im to nikto neukázal.", S["lead"]))
    st.append(Paragraph(
        "Väčšina z týchto chýb nestojí veľa peňazí v momente, keď ich robíš. "
        "Stoja ťa až potom, keď kúpiš sedačku, ktorá sa nezmestí. Keď musíš prerobiť elektriku, "
        "lebo svetlo je na zlom mieste. Keď máš doma plno vecí a stále to „nie je ono“.", S["p"]))
    st.append(Paragraph(
        "Toto nie je zoznam trendov. Sú to chyby, ktoré vidím v teréne najčastejšie, "
        "zoradené od najdrahšej. Pri každej ti napíšem, čo sa dá spraviť <b>hneď a zadarmo</b>, "
        "aj čo si nechať na neskôr.", S["p"]))
    st.append(Spacer(1, 6))
    st.append(tipbox(
        "<i><b>Ako to čítať:</b> nemusíš spraviť všetko naraz. Prejdi si to v pokoji "
        "a označ si tie body, v ktorých sa spoznáš. Väčšina žien sa v bode 2 spozná okamžite.</i>"))
    st.append(Spacer(1, 10))
    st.append(Paragraph("Miriam", S["lead"]))

    # ---------- CHYBA 1 ----------
    st.append(PageBreak())
    st.extend(mistake(
        1, "Kupuješ skôr, než máš plán",
        ["Toto je zďaleka najdrahšia chyba a robí ju skoro každý. Príde chuť na zmenu, "
         "človek si otvorí e-shop a kúpi prvú vec: sedačku, koberec, svietidlo. "
         "A až potom rieši, ako to bude celé vyzerať.",
         "Problém je, že prvý kus nábytku ti určí všetko ostatné. Jeho farbu, štýl, rozmer aj "
         "výšku musí zvyšok priestoru rešpektovať. Keď ho kúpiš naslepo, celý zvyšok domácnosti "
         "sa mu potom prispôsobuje, a to je vždy drahšie.",
         "Poznám to aj z druhej strany: klientka mi ukáže, čo už kúpila, a ja musím návrh "
         "ohýbať okolo veci, ktorá tam nemala byť. Dá sa to. Ale stojí to viac."],
        "Zle kúpená sedačka alebo kuchynská linka = <b>stovky až tisíce eur</b>, ktoré sa "
        "už nevrátia. A väčšinou sa nedá ani vrátiť, ani predať bez straty.",
        "Kým nemáš dispozíciu a rozpočet na papieri, <b>nekupuj nič, čo sa nedá vrátiť</b>. "
        "Ani v akcii. Akcia sa opakuje, zle kúpená sedačka ostáva."))

    # ---------- CHYBA 2 ----------
    st.append(PageBreak())
    st.extend(mistake(
        2, "Nábytok je „polepený“ o steny a miestnosť nemá centrum",
        ["Keď prídem k niekomu domov, toto vidím najčastejšie. Všetok nábytok je natlačený "
         "po obvode miestnosti a stred je prázdny. Vyzerá to upratane a priestorne, "
         "a pritom je to presne ten dôvod, prečo sa tam nikomu dobre nesedí.",
         "Miestnosť potrebuje <b>centrum</b>. Miesto, ku ktorému sa všetko vzťahuje: sedacia zostava "
         "otočená k sebe, koberec, ktorý ju drží pokope, stolík v dosahu. Keď centrum chýba, "
         "priestor pôsobí chladne, aj keď je v ňom drahý nábytok.",
         "Skús jednu vec, hneď teraz: <b>postav sa do dverí každej miestnosti a opýtaj sa: "
         "kam ma priestor prirodzene vedie?</b> Ak nevieš odpovedať do troch sekúnd, "
         "dispozícia pracuje proti tebe."],
        "Táto chyba ťa nestojí peniaze priamo, stojí ťa <b>to, že priestor nepoužívaš</b>. "
        "Platíš hypotéku za miestnosť, v ktorej nikto nechce sedieť.",
        "Odtiahni sedačku od steny čo i len o 20–30 cm a otoč kreslo k nej. "
        "<b>Nestojí to nič</b> a rozdiel je cítiť okamžite."))

    # ---------- CHYBA 3 ----------
    st.append(PageBreak())
    st.extend(mistake(
        3, "Zablokovaný vstup a cesty, ktoré nikam nevedú",
        ["Prvé dva metre za dverami rozhodujú o tom, ako celé bývanie pôsobí. Ak hneď pri vstupe "
         "narazíš na skriňu, roh stola alebo kôš na bielizeň, priestor sa v tvojej hlave "
         "zmenší, bez ohľadu na to, koľko má metrov štvorcových.",
         "To isté platí o prechodoch medzi miestnosťami. Hlavná cesta domácnosťou má byť voľná a rovná. "
         "Ak sa musíš pretáčať bokom alebo obchádzať nábytok, niečo je zle umiestnené.",
         "Držím sa jednoduchého pravidla: <b>hlavný prechod aspoň 90 cm, vedľajší aspoň 70 cm.</b> "
         "Pod tieto čísla nejdem, ani keď to znamená menší nábytok."],
        "Toto sa najčastejšie rieši až pri rekonštrukcii, <b>búraním a presúvaním priečok</b>. "
        "Vtedy je to najdrahšia položka celého projektu.",
        "Zmeraj si prechody metrom, nie od oka. Čokoľvek, čo do 90 cm zasahuje "
        "a dá sa presunúť, presuň <b>ešte dnes</b>."))

    # ---------- CHYBA 4 ----------
    st.append(PageBreak())
    st.extend(mistake(
        4, "Jedno svetlo v strede stropu",
        ["Toto je chyba, ktorú vidím aj v draho zariadených domácnostiach. Jedno svietidlo uprostred "
         "miestnosti nasvieti všetko rovnako plocho, a priestor vyzerá lacnejšie, než v skutočnosti je.",
         "Svetlo v miestnosti má mať <b>tri vrstvy</b>: celkové (strop), pracovné (kuchynská linka, "
         "čítanie) a náladové (nepriame, nízko pri zemi alebo za nábytkom). Až keď ich vieš "
         "zapínať zvlášť, priestor sa dá „prepnúť“ z upratovania na večer s vínom.",
         "Pozor aj na teplotu svetla. Do obývacích priestorov patrí <b>teplá biela, okolo 2700–3000 K</b>. "
         "Studená biela je do garáže a do ordinácie, nie do obývačky."],
        "Ak zistíš, že chceš svetlo inde, ide o <b>sekanie do stien a novú elektriku</b>, "
        "vrátane maľovania. Je to jedna z mála vecí, ktoré sa naozaj neoplatí robiť dvakrát.",
        "Pridaj dve stojacie alebo stolové lampy s teplou žiarovkou do rohov miestnosti "
        "a hlavné svetlo večer zhasni. <b>Zmena je okamžitá</b> a vieš to spraviť za jeden večer."))

    # ---------- CHYBA 5 ----------
    st.append(PageBreak())
    st.extend(mistake(
        5, "Rozmery „od oka“: hlavne koberec a závesy",
        ["Väčšina domácností nemá zlý vkus. Má zlé rozmery. Koberec o dve čísla menší, závesy, "
         "ktoré končia na parapete, obraz zavesený privysoko. Každá vec zvlášť je v poriadku, "
         "spolu pôsobia neusporiadane a človek nevie prísť na to prečo.",
         "Tri čísla, ktoré používam prakticky vždy:",
         "<b>Koberec:</b> aspoň predné nohy sedačky a kresiel musia stáť na ňom. Koberec, ktorý "
         "„pláva“ v strede miestnosti, ju opticky rozbije.<br/>"
         "<b>Závesy:</b> vešať tesne pod strop, nie nad okno, a nechať ich siahať po podlahu. "
         "Miestnosť tým opticky vyrastie.<br/>"
         "<b>Obrazy:</b> stred obrazu vo výške očí, teda zhruba 145–150 cm nad podlahou."],
        "Nie je to katastrofa, ale <b>opakuje sa to</b>. Malý koberec, krátke závesy, "
        "doplnky z akcie, a po pol roku máš doma plno vecí a stále to nie je ono.",
        "Kým niečo objednáš, <b>vylep si rozmer páskou priamo na podlahu alebo stenu</b>. "
        "Deň sa na to pozeraj. Ušetrí ti to viac peňazí než akákoľvek zľava."))

    # ---------- ZHRNUTIE ----------
    st.append(PageBreak())
    st.append(Paragraph("Čo s tým teraz", S["h2"]))
    st.append(Spacer(1, 6))
    st.append(Paragraph(
        "Ak si v tomto zozname našla dve alebo tri veci, je to úplne normálne. "
        "Dobrá správa je, že <b>väčšina sa dá opraviť bez veľkej rekonštrukcie</b>: "
        "presunutím, dokúpením správneho rozmeru a poriadkom v poradí krokov.", S["lead"]))
    st.append(Spacer(1, 4))
    st.append(Paragraph("ZAČNI TÝMTO, DNES A ZADARMO", S["label"]))
    for i, t in enumerate([
        "Postav sa do dverí každej miestnosti a nájdi jej centrum (chyba 2).",
        "Zmeraj metrom prechody. Pod 90 cm = problém (chyba 3).",
        "Večer zhasni hlavné svetlo a zapni dve lampy (chyba 4).",
        "Vylep si na podlahu rozmer koberca, ktorý zvažuješ (chyba 5).",
        "A hlavne: kým nemáš plán, nekupuj nič nevratné (chyba 1).",
    ], 1):
        st.append(Paragraph(f'<font face="Body-B" color="#B08D46">{i}.</font>  {t}', S["p"]))

    # ---------- CTA ----------
    st.append(NextPageTemplate("closing"))
    st.append(PageBreak())
    st.append(Spacer(1, 30*mm))
    st.append(Paragraph("A ČO ĎALEJ?", S["eyeb"]))
    st.append(Spacer(1, 14))
    st.append(Paragraph("Toto je päť chýb.<br/>Tvoj domov má svoje.", S["ctah"]))
    st.append(Spacer(1, 16))
    st.append(Paragraph(
        "Zoznam ti pomôže s tým, čo je spoločné. Ale nepovie ti, čo riešiť "
        "<b>ako prvé práve u teba</b>, a to je presne tá vec, ktorá rozhoduje o tom, "
        "koľko peňazí minieš zbytočne.", S["cta"]))
    st.append(Spacer(1, 10))
    st.append(Paragraph(
        "Preto robím <b>Interiérovú diagnostiku</b>: prídem k tebe domov, strávime spolu "
        "90 minút priamo v priestore a odchádzaš s jasným plánom: čo zmeniť ako prvé, "
        "čo prestať kupovať a v akom poradí postupovať.", S["cta"]))
    st.append(Spacer(1, 14))

    box = Table([[Paragraph(
        '<font face="Body-B" size="15" color="#B08D46">Interiérová diagnostika · 249 €</font><br/>'
        '<font face="Body" size="10" color="#FAF6EF">90 minút u teba doma · akčný plán priorít · '
        'zoznam „čo prestať kupovať“</font><br/><br/>'
        '<font face="Body-B" size="10.5" color="#FAF6EF">Celú sumu ti odpočítam, '
        'ak budeme pokračovať projektom.</font>', S["cta"])]], colWidths=[150*mm])
    box.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.8, GOLD),
        ("LEFTPADDING", (0, 0), (-1, -1), 14), ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 13), ("BOTTOMPADDING", (0, 0), (-1, -1), 13),
    ]))
    st.append(box)
    st.append(Spacer(1, 16))
    st.append(Paragraph(
        "Beriem iba 3–4 projekty mesačne, aby som každej klientke dala čas.", S["cta"]))
    st.append(Spacer(1, 8))
    st.append(Paragraph(
        '<font color="#B08D46" face="Body-B">Rezervuj si termín →  '
        'www.miriamczompoly.sk/diagnostika</font>', S["cta"]))
    st.append(Spacer(1, 18))
    st.append(Paragraph(
        '<font color="#9A8C7A" size="9">Miriam Czompoly · interiérová dizajnérka · Trnava<br/>'
        'dizajn@miriamczompoly.sk · +421 918 819 906</font>', S["cta"]))

    doc.build(st)
    print("OK ->", OUT, os.path.getsize(OUT), "B")


if __name__ == "__main__":
    build()

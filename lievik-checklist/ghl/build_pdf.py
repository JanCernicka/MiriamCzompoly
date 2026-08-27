"""PDF checklistu "Kym podpises preberaci protokol" vo vizuale Miriam Czompoly.

Zdroj textu: ghl/checklist-zdroj.md (jej vlastny text, obsahovo nemeneny).

Dve veci, na ktore pozor (obe stali cas na predoslom lead magnete):
1. DejaVuSans NEMA italic rez, takze <i> sa ticho ignoruje. Rodina sa musi
   zaregistrovat cez registerFontFamily s Liberation Sans Italic.
2. NextPageTemplate treba prepnut hned na prvej strane, inak vnutorne strany
   zdedia tmavu obalku.
"""
from __future__ import annotations

import re
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, NextPageTemplate,
                                PageBreak, PageTemplate, Paragraph, Spacer)

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "ghl" / "checklist-zdroj.md"
OUT = ROOT / "assets" / "checklist-preberanie-bytu.pdf"

# paleta z jej webu
PAPER = HexColor("#FAF6EF")
INK = HexColor("#262019")
INK_SOFT = HexColor("#4C453B")
BRASS = HexColor("#A9885E")
BRASS_DEEP = HexColor("#856A44")
LINE = HexColor("#E4D9C6")

FONTS = "/usr/share/fonts/truetype"


def register_fonts() -> tuple[str, str]:
    """Patkove na nadpisy, bezpatkove na text. Vrati (serif, sans)."""
    cands = {
        "Serif": [f"{FONTS}/liberation/LiberationSerif-Regular.ttf",
                  f"{FONTS}/dejavu/DejaVuSerif.ttf"],
        "Serif-B": [f"{FONTS}/liberation/LiberationSerif-Bold.ttf",
                    f"{FONTS}/dejavu/DejaVuSerif-Bold.ttf"],
        "Body": [f"{FONTS}/liberation/LiberationSans-Regular.ttf",
                 f"{FONTS}/dejavu/DejaVuSans.ttf"],
        "Body-B": [f"{FONTS}/liberation/LiberationSans-Bold.ttf",
                   f"{FONTS}/dejavu/DejaVuSans-Bold.ttf"],
        "Body-I": [f"{FONTS}/liberation/LiberationSans-Italic.ttf",
                   f"{FONTS}/dejavu/DejaVuSans-Oblique.ttf"],
    }
    for name, paths in cands.items():
        for p in paths:
            if Path(p).is_file():
                pdfmetrics.registerFont(TTFont(name, p))
                break
        else:
            raise SystemExit(f"chyba font pre {name}")
    # bez tohto sa <i> ticho ignoruje
    pdfmetrics.registerFontFamily("Body", normal="Body", bold="Body-B",
                                  italic="Body-I", boldItalic="Body-B")
    return "Serif", "Body"


SERIF, SANS = register_fonts()

S = {
    "h1": ParagraphStyle("h1", fontName="Serif-B", fontSize=30, leading=35,
                         textColor=PAPER, alignment=TA_CENTER, spaceAfter=8),
    "sub": ParagraphStyle("sub", fontName="Body", fontSize=11.5, leading=17,
                          textColor=HexColor("#D8CBB4"), alignment=TA_CENTER),
    "author": ParagraphStyle("author", fontName="Body", fontSize=10, leading=14,
                             textColor=BRASS, alignment=TA_CENTER),
    "h2": ParagraphStyle("h2", fontName="Serif-B", fontSize=19, leading=24,
                         textColor=INK, spaceBefore=16, spaceAfter=7),
    "h3": ParagraphStyle("h3", fontName="Body-B", fontSize=11, leading=15,
                         textColor=BRASS_DEEP, spaceBefore=13, spaceAfter=5),
    "p": ParagraphStyle("p", fontName="Body", fontSize=9.8, leading=15.5,
                        textColor=INK_SOFT, alignment=TA_LEFT, spaceAfter=6),
    "item": ParagraphStyle("item", fontName="Body", fontSize=9.8, leading=15,
                           textColor=INK, leftIndent=13, spaceAfter=5,
                           bulletIndent=0, bulletFontName="Body", bulletFontSize=9.8),
    "note": ParagraphStyle("note", fontName="Body-I", fontSize=8.6, leading=13,
                           textColor=HexColor("#857B6C"), spaceBefore=6),
    "cta": ParagraphStyle("cta", fontName="Body-B", fontSize=10.5, leading=16,
                          textColor=PAPER, alignment=TA_CENTER),
}


def md_inline(s: str) -> str:
    """**tucne** a *kurziva* na reportlab znacky, plus escapovanie."""
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    s = re.sub(r"\*\*(.+?)\*\*", r'<font name="Body-B">\1</font>', s)
    s = re.sub(r"(?<!\*)\*([^*]+?)\*(?!\*)", r"<i>\1</i>", s)
    return s


def cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(INK)
    canvas.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
    canvas.setFillColor(BRASS)
    canvas.rect(0, A4[1] - 6 * mm, A4[0], 6 * mm, stroke=0, fill=1)
    canvas.restoreState()


def inner(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(20 * mm, 16 * mm, A4[0] - 20 * mm, 16 * mm)
    canvas.setFont("Body", 7.6)
    canvas.setFillColor(HexColor("#857B6C"))
    canvas.drawString(20 * mm, 11 * mm, "Miriam Czompoly  ·  interiérový dizajn")
    canvas.drawRightString(A4[0] - 20 * mm, 11 * mm, str(canvas.getPageNumber() - 1))
    canvas.restoreState()


def build() -> None:
    text = SRC.read_text(encoding="utf-8")
    # 🔴 klient zakazal dlhe pomlcky, v zdroji su
    text = text.replace(" — ", ", ").replace("—", ",").replace(" – ", ", ")

    doc = BaseDocTemplate(str(OUT), pagesize=A4,
                          title="Kým podpíšeš preberací protokol",
                          author="Miriam Czompoly",
                          leftMargin=20 * mm, rightMargin=20 * mm,
                          topMargin=20 * mm, bottomMargin=22 * mm)
    fw, fh = A4[0] - 40 * mm, A4[1] - 42 * mm
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[Frame(20 * mm, 20 * mm, fw, fh, id="c")],
                     onPage=cover),
        PageTemplate(id="inner", frames=[Frame(20 * mm, 22 * mm, fw, fh, id="i")],
                     onPage=inner),
    ])

    story = [NextPageTemplate("inner"), Spacer(1, 58 * mm),
             Paragraph("Kým podpíšeš<br/>preberací protokol", S["h1"]),
             Spacer(1, 7 * mm),
             Paragraph("Čo si vypýtať od developera a čo rozhodnúť skôr, "
                       "než je to drahé alebo nemožné", S["sub"]),
             Spacer(1, 24 * mm),
             Paragraph("Miriam Czompoly", S["author"]),
             Paragraph("interiérová dizajnérka", S["author"]),
             PageBreak()]

    skip = {"# Kým podpíšeš preberací protokol"}
    for raw in text.split("\n"):
        line = raw.rstrip()
        if not line or line in skip or line.startswith("---"):
            continue
        if line.startswith("**Čo si vypýtať") or line.startswith("Interiérová dizajnérka"):
            continue
        if line.startswith("### "):
            story.append(Paragraph(md_inline(line[4:]), S["h2"]))
        elif line.startswith("## "):
            story.append(Paragraph(md_inline(line[3:]), S["h3"]))
        elif line.startswith("# "):
            story.append(Paragraph(md_inline(line[2:]), S["h2"]))
        elif line.startswith("- [ ] "):
            story.append(Paragraph(md_inline(line[6:]), S["item"], bulletText="□"))
        elif line.startswith("→ ") or line.startswith("@"):
            continue
        elif line.startswith("*Toto nie je"):
            story.append(Spacer(1, 4 * mm))
            story.append(Paragraph(md_inline(line.strip("*")), S["note"]))
        else:
            story.append(Paragraph(md_inline(line), S["p"]))

    doc.build(story)
    print(f"OK {OUT}  ({OUT.stat().st_size // 1024} kB)")


if __name__ == "__main__":
    build()

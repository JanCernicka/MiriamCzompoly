#!/usr/bin/env bash
# Nasadí DRUHÚ VERZIU lievika (poukážka vytŕča z obálky, namiesto videa) na
# https://miriam-sutaz-poukazka.pages.dev. Zdroj je ten istý ako pri ./nasad.sh,
# rozdiel je len blok medzi <!-- VERZIA-VIDEO --> v index.html a data-verzia="poukazka".
set -euo pipefail
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST="$(mktemp -d)"
cp -a "$SRC/." "$DIST/"
rm -f "$DIST/README.md" "$DIST/kontrola.py" "$DIST/nasad.sh" "$DIST/nasad-poukazka.sh"
rm -rf "$DIST/ghl" "$DIST/varianty"
python3 - "$DIST" "$SRC/varianty/poukazka-hero.html" <<'PY'
import sys, re, pathlib
dist, blok = pathlib.Path(sys.argv[1]), open(sys.argv[2]).read()
p = dist / "index.html"; s = p.read_text()
n = len(re.findall(r"<!-- VERZIA-VIDEO:.*?<!-- /VERZIA-VIDEO -->", s, flags=re.S))
assert n == 1, f"v index.html musí byť presne jeden blok VERZIA-VIDEO, je {n}"
s = re.sub(r"[ \t]*<!-- VERZIA-VIDEO:.*?<!-- /VERZIA-VIDEO -->\n", lambda m: blok, s, flags=re.S)
p.write_text(s)
for f in ("index.html", "dotaznik.html", "dakujem.html"):
    q = dist / f; t = q.read_text()
    assert t.count('data-verzia="video"') == 1, f
    q.write_text(t.replace('data-verzia="video"', 'data-verzia="poukazka"'))
assert "data-vsl" not in (dist / "index.html").read_text()
print("verzia poukazka pripravená")
PY
cd "$DIST"
npx -y wrangler pages deploy . --project-name=miriam-sutaz-poukazka --branch=main --commit-dirty=true
rm -rf "$DIST"

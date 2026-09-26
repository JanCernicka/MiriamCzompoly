#!/usr/bin/env bash
# Nasadí lievik na https://miriam-sutaz.pages.dev (bez README a kontrolného skriptu).
# --branch=main je povinný, inak vznikne len preview.
set -euo pipefail
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST="$(mktemp -d)"
cp -a "$SRC/." "$DIST/"
rm -f "$DIST/README.md" "$DIST/kontrola.py" "$DIST/nasad.sh"
cd "$DIST"
npx -y wrangler pages deploy . --project-name=miriam-sutaz --branch=main --commit-dirty=true
rm -rf "$DIST"

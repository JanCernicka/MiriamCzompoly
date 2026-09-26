#!/usr/bin/env bash
# Nasadí hlavný web (www.miriamczompoly.sk, projekt miriam-web-staging) aj s funkciami
# (A/B rozdeľovač /diagnostika, meranie, /api/*).
#   ./nasad-web.sh            ostrá verzia (--branch=main, inak vznikne len náhľad)
#   ./nasad-web.sh ab-test    náhľad na ab-test.miriam-web-staging.pages.dev
# Vynechá priečinky, ktoré na web nepatria (konzola, zberač, varianta B má vlastný projekt).
# Všetko ostatné ide von tak ako doteraz, lebo na niektoré súbory odkazujú e-maily
# (napr. ghl/ebook/5-najdrahsich-chyb.pdf).
set -euo pipefail
VETVA="${1:-main}"
KOREN="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST="$(mktemp -d)"
cd "$KOREN"
tar --exclude=.git --exclude=./konzola --exclude=./meranie --exclude=./diagnostika-b \
    --exclude=./.wrangler --exclude=./nasad-web.sh -cf - . | tar -xf - -C "$DIST"
cd "$DIST"
npx -y wrangler pages deploy . --project-name=miriam-web-staging --branch="$VETVA" --commit-dirty=true
rm -rf "$DIST"

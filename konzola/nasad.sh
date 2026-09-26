#!/usr/bin/env bash
# Nasadí konzolu Miriam (konzola-miriamczompoly). Tajomstvá ostávajú v Cloudflare.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
npx -y wrangler pages deploy dist --project-name=konzola-miriamczompoly --branch=main --commit-dirty=true

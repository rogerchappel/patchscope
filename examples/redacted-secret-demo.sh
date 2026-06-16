#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/patchscope-redacted-secret-demo"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cd "$ROOT_DIR"
npm run build

node dist/cli.js scan examples/secret.patch --json > "$OUT_DIR/secret-report.json"
node dist/cli.js scan examples/feature.patch --out "$OUT_DIR/feature-report.md"

test -s "$OUT_DIR/secret-report.json"
test -s "$OUT_DIR/feature-report.md"
grep -q "PatchScope" "$OUT_DIR/feature-report.md"
node -e "const fs=require('node:fs'); const text=fs.readFileSync(process.argv[1], 'utf8'); if (text.includes('sk_live_')) process.exit(1); const data=JSON.parse(text); if (!JSON.stringify(data).includes('secret')) process.exit(1);" "$OUT_DIR/secret-report.json"

printf 'PatchScope demo wrote reports to %s\n' "$OUT_DIR"

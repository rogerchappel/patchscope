#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

node dist/cli.js help >/tmp/patchscope-help.txt
grep -q "PatchScope" /tmp/patchscope-help.txt

node dist/cli.js scan examples/feature.patch --out /tmp/patchscope-feature.md
grep -q "src/service.ts" /tmp/patchscope-feature.md

node dist/cli.js scan examples/secret.patch --json >/tmp/patchscope-secret.json
node -e "const report=require('/tmp/patchscope-secret.json'); if (!report.risks.some((r)=>r.class==='secret')) process.exit(1)"

node dist/cli.js suggest-tests examples/feature.patch | grep -E "(npm run test|git diff --check)" >/dev/null

if node dist/cli.js scan examples/secret.patch --fail-on secret >/tmp/patchscope-fail.md; then
  echo "expected --fail-on secret to exit non-zero" >&2
  exit 1
fi

echo "patchscope smoke ok"

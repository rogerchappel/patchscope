#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
scratch_dir="$(mktemp -d "${TMPDIR:-/tmp}/patchscope-package-smoke.XXXXXX")"
trap 'rm -rf "$scratch_dir"' EXIT

cd "$repo_root"

archive_name="$(npm pack --pack-destination "$scratch_dir")"
archive="$scratch_dir/$archive_name"
install_prefix="$scratch_dir/install"

npm install --global --prefix "$install_prefix" "$archive"

cli="$install_prefix/bin/patchscope"
installed_package="$(npm root --global --prefix "$install_prefix")/patchscope"
expected_version="$(node -p "JSON.parse(require('node:fs').readFileSync('package.json', 'utf8')).version")"
actual_version="$("$cli" version)"

if [ "$actual_version" != "$expected_version" ]; then
  printf 'expected version %s, got %s\n' "$expected_version" "$actual_version" >&2
  exit 1
fi

"$cli" scan "$installed_package/examples/feature.patch" --out "$scratch_dir/feature.md"
grep -q 'src/service.ts' "$scratch_dir/feature.md"

printf 'installed package smoke ok (%s)\n' "$actual_version"

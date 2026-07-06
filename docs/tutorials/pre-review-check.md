# Pre-Review Check With PatchScope

Use this recipe when you want a local, deterministic look at a patch before it
becomes a pull request.

## Start With a Fixture

```sh
npm install
npm run build
node dist/cli.js scan examples/feature.patch --out /tmp/patchscope-feature.md
node dist/cli.js suggest-tests examples/feature.patch
```

The first command writes a Markdown risk report. The second command prints the
likely verification commands inferred from the changed paths and package
scripts.

## Check for Redaction

```sh
bash examples/redacted-secret-demo.sh
```

The demo scans `examples/secret.patch` as JSON and verifies that the original
secret-like value does not appear in the generated report.

## Use It on Local Work

```sh
patchscope scan --staged --fail-on secret,huge-generated
patchscope suggest-tests --staged
```

`--fail-on` exits non-zero when any listed class or risk level appears. Use it
as a local gate before opening a pull request, then run the suggested checks
that make sense for the change.

## What to Share

- The Markdown report when a reviewer needs a compact map of changed files,
  risk classes, and suggested checks.
- The JSON report when another tool or agent needs stable structured evidence.
- The exact verification commands that were actually run after PatchScope made
  suggestions.

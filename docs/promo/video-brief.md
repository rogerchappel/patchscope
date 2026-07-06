# PatchScope Video Brief

## Angle

PatchScope turns a noisy git patch into a compact pre-review checklist: changed
areas, risk classes, redacted secret-like additions, and likely local checks.

## 45-Second Flow

1. Show `examples/feature.patch` as a plain unified diff.
2. Run `node dist/cli.js scan examples/feature.patch --out /tmp/patchscope-feature.md`.
3. Open the Markdown report and highlight touched paths, risk classes, and
   suggested verification.
4. Run `bash examples/redacted-secret-demo.sh`.
5. Show that the demo wrote JSON and Markdown reports while checking that the
   secret-like fixture stays redacted.

## On-Screen Commands

```sh
npm install
npm run build
node dist/cli.js scan examples/feature.patch --out /tmp/patchscope-feature.md
bash examples/redacted-secret-demo.sh
```

## Honest Limits

- PatchScope is not a SAST scanner, LLM reviewer, or CI replacement.
- It does not modify source files.
- It reports deterministic local evidence that should be paired with the normal
  project test suite.
